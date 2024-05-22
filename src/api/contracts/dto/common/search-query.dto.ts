import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryParams } from '../../../generic/dto';

export class SearchContractsQueryDto extends PaginationQueryParams {
  @IsEnum(ContractStatus, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    enum: ContractStatus,
    isArray: true,
    description: 'Contract status of deployment',
  })
  readonly status?: ContractStatus[];
}
