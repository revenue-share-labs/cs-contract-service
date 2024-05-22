import { Chain, ContractStatus, ContractType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValveV1ContractOwnerDto } from '../contracts/types/valve/valve-v1-contract-owner.dto';
import { ParticipantStatus } from './search.dto';

export class ContractCommonDetailsDto {
  @ApiProperty({
    description: 'Contract internal id',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Contract author: user internal id',
  })
  readonly author: string;

  @ApiPropertyOptional({
    description:
      'A wallet that can change the Distributor and the Controller of a contract',
    type: () => ValveV1ContractOwnerDto,
  })
  readonly owner: ValveV1ContractOwnerDto;

  @ApiProperty({
    description:
      'Name of a RSC contract. A contract name is self-explanatory and is needed to easily differentiate between two or more SC. A contract name is publicly visible',
  })
  readonly title: string;

  @ApiPropertyOptional({ description: 'Contract chain address' })
  readonly address?: string;

  @ApiProperty({
    description: 'Contract status of deployment',
    enum: ContractStatus,
  })
  readonly status: ContractStatus;

  @ApiProperty({
    description: 'Type of contract: VALVE, PREPAYMENT, WATERFALL etc.',
    enum: ContractType,
  })
  readonly type: ContractType;

  @ApiPropertyOptional({
    description: 'Blockchain on which the contract will be deployed',
    enum: Chain,
  })
  readonly chain?: Chain;

  @ApiPropertyOptional({
    description: 'Participant status',
  })
  readonly participantStatus?: ParticipantStatus[];

  @ApiProperty({ description: 'Contract creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Contract last update date' })
  readonly updatedAt: Date;

  @ApiPropertyOptional({ description: 'Contract published date' })
  readonly publishedAt: Date;
}
