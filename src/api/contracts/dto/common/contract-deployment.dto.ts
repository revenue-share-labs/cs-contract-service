import {
  ContractDeploymentStatus,
  ContractDeploymentStrategy,
} from '@prisma/client';
import { CreatedContractType, ValveV1ContractCreatedDto } from '..';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';

export class ContractDeploymentDto {
  @ApiProperty({
    description: 'Contract deployment id',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Contract deployment status',
    enum: ContractDeploymentStatus,
  })
  readonly status: ContractDeploymentStatus;

  @ApiProperty({
    description: 'Contract deployment strategy',
    enum: ContractDeploymentStrategy,
  })
  readonly strategy: ContractDeploymentStrategy;

  @ApiPropertyOptional({
    description: 'Contract deployment transaction',
    enum: ContractDeploymentStrategy,
  })
  readonly transaction?: string;

  @ApiProperty({
    description: 'Contract deployment source contract',
    oneOf: [{ $ref: getSchemaPath(ValveV1ContractCreatedDto) }],
  })
  readonly contract: CreatedContractType;
}
