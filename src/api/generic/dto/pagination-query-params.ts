import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class PaginationQueryParams {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    minimum: 0,
    default: 0,
    exclusiveMinimum: true,
    description: 'Search offset',
  })
  readonly offset: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    minimum: 1,
    maximum: 100,
    default: 1,
    exclusiveMinimum: true,
    description: 'Search limit',
  })
  readonly limit: number;
}
