import { validate } from 'class-validator';
import 'reflect-metadata'
import { FindAllQueryDto } from './find-all.query.dto'

describe('FindAllQueryDto', () => {
  let dto: FindAllQueryDto;

  beforeEach(() => {
    dto = new FindAllQueryDto();
  });

  it('should validate with default values', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(1);
    expect(dto.orderBy).toEqual(['id']);
    expect(dto.orderByDirection).toBe('ASC');
  });

  it('should allow optional searchTerm as a string', async () => {
    dto.searchTerm = 'search query';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should throw an error if searchTerm has length < 2', async () => {
    dto.searchTerm = 't' as any;  // Invalid type
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('searchTerm');
  });

  it('should validate page with minimum value of 1', async () => {
    dto.page = 0;  // Invalid value
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.min).toBeDefined();
  });

  it('should throw an error if pageSize is more than 100', async () => {
    dto.pageSize = 101;  // Invalid value
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.max).toBeDefined();
  });

  it('should validate orderBy as an array of allowed values', async () => {
    dto.orderBy = ['name', 'id'];  // Valid values
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should throw an error if orderBy contains invalid values', async () => {
    dto.orderBy = ['invalidField'];  // Invalid value
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toBeDefined();
  });

  it('should validate orderByDirection as ASC or DESC', async () => {
    dto.orderByDirection = 'DESC';  // Valid value
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should throw an error if orderByDirection is not ASC or DESC', async () => {
    dto.orderByDirection = 'ESC' as any;  // Invalid value
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEnum).toBeDefined();
  });
});
