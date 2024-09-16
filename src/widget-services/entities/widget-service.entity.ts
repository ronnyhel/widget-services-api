import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToMany } from 'typeorm';
import { WidgetVersion } from './widget-version.entity';

@Entity()
export class WidgetService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500, nullable: false })
  description: string;

  @Column({ length: 500, nullable: false } )
  name: string;

  @Column()
  numOfVersions: number;

  @OneToMany(() => WidgetVersion, (widgetVersion) => widgetVersion.widgetService, {
    cascade: true
  })
  widgetVersions: WidgetVersion[];




}