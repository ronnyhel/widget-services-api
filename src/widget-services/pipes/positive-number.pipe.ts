import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe to transform a string into a positive integer and throw an error if the value is not a positive integer.
 */
@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('ID must be a positive integer greater than 0');
    }
    return id;
  }
}
