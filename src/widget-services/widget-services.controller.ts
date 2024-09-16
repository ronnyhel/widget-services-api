import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { WidgetServicesService } from './widget-services.service';
import { FindAllQueryDto } from './dto/find-all.query.dto';
import { PositiveIntPipe } from './pipes/positive-number.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUpdateWidgetServiceDto } from './dto/create-update-widget-service.dto';

@Controller('widget-services')
export class WidgetServicesController {

  constructor(private readonly widgetServicesService: WidgetServicesService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: FindAllQueryDto) {
    return this.widgetServicesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', PositiveIntPipe) id: string): any {
    return this.widgetServicesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createWidgetServiceDto: CreateUpdateWidgetServiceDto) {
    return this.widgetServicesService.create(createWidgetServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', PositiveIntPipe) id: number, @Body() updateWidgetServiceDto: CreateUpdateWidgetServiceDto) {
    return this.widgetServicesService.update(id, updateWidgetServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', PositiveIntPipe) id: number) {
    return this.widgetServicesService.remove(id);
  }

}
