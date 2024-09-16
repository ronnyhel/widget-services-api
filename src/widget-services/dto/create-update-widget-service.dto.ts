import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { WidgetVersionDto } from './widget-version.dto';
export class CreateUpdateWidgetServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  widgetVersions: WidgetVersionDto[];

}