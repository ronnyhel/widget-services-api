import { Module } from '@nestjs/common';
import { WidgetServicesService } from './widget-services.service';
import { WidgetServicesController } from './widget-services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetService } from './entities/widget-service.entity';
import { WidgetVersion } from './entities/widget-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WidgetService, WidgetVersion])],
  providers: [WidgetServicesService],
  exports: [WidgetServicesService],
  controllers: [WidgetServicesController],
})
export class WidgetServicesModule {
}
