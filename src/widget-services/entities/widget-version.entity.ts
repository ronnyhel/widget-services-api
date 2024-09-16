import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { WidgetService } from './widget-service.entity';

@Entity()
export class WidgetVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, nullable: false })
  name: string;

  @ManyToOne(() => WidgetService, (widgetService) => widgetService.widgetVersions)
  widgetService: WidgetService;

}