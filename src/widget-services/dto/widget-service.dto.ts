import { WidgetVersionDto } from './widget-version.dto';

export class WidgetServiceDto {
  id: number;

  description: string;

  name: string;

  numOfVersions: number;

  widgetVersions?: WidgetVersionDto[];

  moreVersionsExist? = false
}
