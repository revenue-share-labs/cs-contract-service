import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '@prisma/client';
import { IsEnum, IsEthereumAddress, ValidateIf } from 'class-validator';

export class PatchContractStatusDto {
  @IsEnum(ContractStatus)
  @ApiProperty({
    description: 'Contract status of deployment',
    enum: ContractStatus,
  })
  readonly status: ContractStatus;

  @ValidateIf((o) => o.status === ContractStatus.PUBLISHED)
  @IsEthereumAddress()
  @ApiPropertyOptional({
    description:
      'Contract chain address, can be editable only for owner while contract in status=DRAFT/PENDING',
  })
  readonly address?: string;
}
