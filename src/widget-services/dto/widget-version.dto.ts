import { IsNotEmpty, IsOptional } from 'class-validator';

export class WidgetVersionDto {

  @IsOptional()
  id?: number;

  @IsNotEmpty()
  name: string;

}