import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { WidgetService } from '../../src/widget-services/entities/widget-service.entity';
import { WidgetVersion } from '../../src/widget-services/entities/widget-version.entity';
import { widgetServicesData } from '../fixtures/test-data';
import { testingUser } from '../fixtures/test-user';

async function resetDatabase(
  widgetServiceRepository: Repository<WidgetService>,
  widgetVersionRepository: Repository<WidgetVersion>,
  userRepository: Repository<any>,
) {
  // Clear the tables
  await widgetVersionRepository.delete({})
  await widgetServiceRepository.delete({});
  await userRepository.delete({});

  // Reset sequences (PostgreSQL example)
  await widgetServiceRepository.query(`ALTER SEQUENCE widget_service_id_seq RESTART WITH 1`);
  await widgetVersionRepository.query(`ALTER SEQUENCE widget_version_id_seq RESTART WITH 1`);
  await userRepository.query(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);

  console.log('Database cleared and sequences reset');
}

async function populateDatabase(
  widgetServiceRepository: Repository<WidgetService>,
  widgetVersionRepository: Repository<WidgetVersion>,
) {
  // Insert the fixed data into the database
  for (const widgetServiceData of widgetServicesData) {
    // Create a new WidgetService
    const widgetService = new WidgetService();
    widgetService.name = widgetServiceData.name;
    widgetService.description = widgetServiceData.description;
    widgetService.numOfVersions = widgetServiceData.numOfVersions;

    // Save the widget service
    const savedWidgetService = await widgetServiceRepository.save(widgetService);

    // Create and save each widget version
    for (const widVer of widgetServiceData.widgetVersions) {
      const widgetVersion = new WidgetVersion();
      widgetVersion.name = widVer.name;
      widgetVersion.widgetService = savedWidgetService;

      // Save the widget version
      await widgetVersionRepository.save(widgetVersion);
    }
  }

  console.log('Database populated with fixed data');
}

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const widgetServiceRepository: Repository<WidgetService> = app.get('WidgetServiceRepository');
  const widgetVersionRepository: Repository<WidgetVersion> = app.get('WidgetVersionRepository');
  const userRepository = app.get('UserRepository');
  const usersService = app.get('UsersService');

  // First, reset the database
  await resetDatabase(widgetServiceRepository, widgetVersionRepository, userRepository);

  // Then, populate the database with fixed data
  await populateDatabase(widgetServiceRepository, widgetVersionRepository);

  //Test user creation for testing purposes
  await usersService.create(testingUser);
  console.log('Test user created');


  await app.close();
}

bootstrap();
