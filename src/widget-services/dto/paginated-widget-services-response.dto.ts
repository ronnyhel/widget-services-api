import { WidgetServiceDto } from './widget-service.dto';

export class PaginatedWidgetServicesResponseDto {
  data?: WidgetServiceDto[];

  count?: number;

  currentPage?: number;

  totalPages?: number;

  //fields for validation errors

  statusCode?: number;

  error?: string;

  message?: any
}
