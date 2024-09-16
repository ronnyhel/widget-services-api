import { IsOptional, IsInt, Min, IsEnum, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidOrderBy } from './custom-validator/order-by.validator';

export class FindAllQueryDto {
  @IsOptional()
  @MinLength(2)
  searchTerm?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number = 1;

  @IsOptional()
  @IsValidOrderBy(['name', 'id', 'description'])
  orderBy?: string[] | string = ['id'];

  @IsEnum(['ASC', 'DESC'], {
    message: 'Valid orderBy Direction required: ASC or DESC',
  })
  orderByDirection?: 'ASC' | 'DESC' = 'ASC';
}