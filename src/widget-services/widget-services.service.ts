import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { WidgetService } from './entities/widget-service.entity';
import { FindAllQueryDto } from './dto/find-all.query.dto';
import { PaginatedWidgetServicesResponseDto } from './dto/paginated-widget-services-response.dto';
import { WidgetServiceDto } from './dto/widget-service.dto';
import { WidgetVersion } from './entities/widget-version.entity';
import { CreateUpdateWidgetServiceDto } from './dto/create-update-widget-service.dto';


@Injectable()
export class WidgetServicesService {
  constructor(
    @InjectRepository(WidgetService)
    private widgetServiceRepository: Repository<WidgetService>,
    @InjectRepository(WidgetVersion)
    private widgetVersionRepository: Repository<WidgetVersion>,
  ) {
  }

  private readonly MAX_VERSIONS_RETRIEVED_BY_FINDONE = 10;

  async findAll(findAllQuery: FindAllQueryDto): Promise<PaginatedWidgetServicesResponseDto> {
    const { page = 1, pageSize = 100, searchTerm, orderBy = ['id'], orderByDirection } = findAllQuery;
    // Ensure orderByFields is an array
    const orderByFields = Array.isArray(orderBy) ? orderBy : [orderBy];

    const query = this.widgetServiceRepository.createQueryBuilder('widgetService');

    // add search term if present
    if (searchTerm) {
      //case-insensitive search
      const lowerSearchTerm = searchTerm.toLowerCase(); // Make the search term lowercase
      query.where('LOWER(widgetService.name) LIKE :searchTerm', { searchTerm: `%${lowerSearchTerm}%` })
        .orWhere('LOWER(widgetService.description) LIKE :searchTerm', { searchTerm: `%${lowerSearchTerm}%` });
    }


    // handle ordering and pagination
    for (const field of orderByFields) {
      query.orderBy(`widgetService.${field}`, orderByDirection);
    }
    query.skip((page - 1) * pageSize);
    query.take(pageSize);

    // execute query
    const [result, total] = await query.getManyAndCount();

    if (total == 0)
      throw new NotFoundException('No Widget Services found');

    return {
      data: result,
      count: total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<WidgetServiceDto | null> {
    // Fetch the WidgetService without the widgetVersions relation first
    const widgetService = await this.widgetServiceRepository.findOne({
      where: { id },
    });

    if (!widgetService) {
      throw new NotFoundException(`Widget Service with ID ${id} not found`);
    }

    // Default the moreVersionsExist to false and spread the widgetService object
    const widgetServiceDto: WidgetServiceDto = { moreVersionsExist: false, ...widgetService };

    if (widgetServiceDto.numOfVersions > this.MAX_VERSIONS_RETRIEVED_BY_FINDONE)
      widgetServiceDto.moreVersionsExist = true;

    // Fetch up to MAX_VERSIONS_RETRIEVED_BY_FINDONE widgetVersions separately
    const limitedWidgetVersions = await this.widgetVersionRepository.find({
      where: { widgetService: { id } },
      order: { id: 'DESC' }, // Order by ID in descending order to get the most updated versions first
      take: this.MAX_VERSIONS_RETRIEVED_BY_FINDONE, // Limit the results to 10 rows
    });

    // Attach the limited widgetVersions to the widgetService object
    widgetServiceDto.widgetVersions = limitedWidgetVersions;

    return widgetServiceDto;
  }

  async create(createWidgetServiceDto: CreateUpdateWidgetServiceDto): Promise<WidgetServiceDto> {
    const widgetService = this.widgetServiceRepository.create(createWidgetServiceDto);
    widgetService.numOfVersions = widgetService.widgetVersions.length;
    await this.widgetServiceRepository.save(widgetService);
    return widgetService;
  }

  async update(id: number, updateWidgetServiceDto: CreateUpdateWidgetServiceDto): Promise<WidgetServiceDto> {
    // Using an explicit transaction block to ensure all operations succeed or fail together.
    return await this.widgetServiceRepository.manager.transaction(async (transactionManager: EntityManager) => {
      // Fetch the widget service inside the transaction
      const existingWidgetService = await transactionManager.findOne(WidgetService, id, { relations: ['widgetVersions'] });

      if (!existingWidgetService) {
        throw new NotFoundException(`Widget Service with ID ${id} not found`);
      }

      // get the scalar fields of the widget service
      const { widgetVersions: toUpdatedWidgetVersions, ...scalarFields } = updateWidgetServiceDto;
      // existing versions inside the transaction
      const existingVersions = existingWidgetService.widgetVersions;

      //Recalculate the number of versions
      const numOfVersions = toUpdatedWidgetVersions ? toUpdatedWidgetVersions.length : 0;

      // update the scalar fields of the widget service
      await transactionManager.update(WidgetService, id, { ...scalarFields, numOfVersions });



      if (toUpdatedWidgetVersions && toUpdatedWidgetVersions.length > 0) {
        // Extract the IDs of the incoming versions
        const incomingVersionIds = toUpdatedWidgetVersions.map(versionDto => versionDto.id);

        // Delete versions that are not present in the incoming update
        const versionsToDelete = existingVersions.filter(
          existingVersion => !incomingVersionIds.includes(existingVersion.id),
        );

        if (versionsToDelete.length > 0) {
          await transactionManager.remove(WidgetVersion, versionsToDelete);
        }

        // Update existing or add new versions
        for (const versionDto of toUpdatedWidgetVersions) {
          if (versionDto.id) {
            const existingVersion = existingVersions.find(v => v.id === versionDto.id);
            if (existingVersion) {
              // Update the existing version
              await transactionManager.update(WidgetVersion, existingVersion.id, versionDto);
            }
          } else {
            // Create a new version if no ID is present (new version)
            const newVersion = transactionManager.create(WidgetVersion, versionDto);
            newVersion.widgetService = existingWidgetService;
            await transactionManager.save(WidgetVersion, newVersion);
          }
        }
      } else {
        // If no versions are provided in the update, remove all existing versions
        await transactionManager.remove(WidgetVersion, existingVersions);
      }

      // Return the updated widget service with the updated versions
      return await transactionManager.findOne(WidgetService, id, { relations: ['widgetVersions'] });
    });
  }

  async remove(id: number): Promise<void> {
    // Start a transaction
    await this.widgetServiceRepository.manager.transaction(async (transactionManager: EntityManager) => {
      // Find the widget service with related widget versions
      const widgetService = await transactionManager.findOne(WidgetService, id, { relations: ['widgetVersions'] });

      if (!widgetService) {
        throw new NotFoundException(`Widget Service with ID ${id} not found`);
      }

      // Remove all related widget versions
      if (widgetService.widgetVersions && widgetService.widgetVersions.length > 0) {
        await transactionManager.remove(widgetService.widgetVersions);
      }

      // Now, delete the widget service itself
      const result = await transactionManager.delete(WidgetService, id);
      if (result.affected === 0) {
        throw new NotFoundException(`Widget Service with ID ${id} not found`);
      }
    });
  }

}