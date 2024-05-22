import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Chain,
  ContractStatus,
  ContractType,
  ContractVisibility,
} from '@prisma/client';
import { ValveV1ContractOwnerDto } from './valve-v1-contract-owner.dto';
import { ValveV1DistributionType } from './valve-v1-prepared-contract.dto';
import { ValveV1RecipientDto } from './valve-v1-recipient.dto';
import { ContractAnonymousUserDto } from '../../../common/contract-anonymous-user.dto';
import { ContractCurrencyDto } from '../../../common/contract-currency.dto';

export class ValveV1ContractCreatedDto {
  @ApiProperty({
    description: 'Contract internal id',
  })
  readonly id: string;

  @ApiProperty({
    description: 'User internal id',
  })
  readonly author: string;

  @ApiPropertyOptional({
    description:
      'A wallet that can change the Distributor and the Controller of a contract',
    type: () => ValveV1ContractOwnerDto,
  })
  readonly owner?: ValveV1ContractOwnerDto;

  @ApiPropertyOptional({ description: 'Contract chain address' })
  readonly address?: string;

  @ApiPropertyOptional({ description: 'Contract description' })
  readonly description?: string;

  @ApiProperty({
    description: 'Contract status of deployment',
    enum: ContractStatus,
  })
  readonly status: ContractStatus;

  @ApiProperty({
    description:
      'Name of a RSC contract. A contract name is self-explanatory and is needed to easily differentiate between two or more SC. A contract name is publicly visible',
  })
  readonly title: string;

  @ApiProperty({
    description: 'Version of contract',
  })
  readonly version: string;

  @ApiPropertyOptional({
    description: 'Blockchain on which the contract will be deployed',
    enum: Chain,
  })
  readonly chain?: Chain;

  @ApiProperty({
    description: 'Type of contract: VALVE, PREPAYMENT, WATERFALL etc.',
    enum: ContractType,
  })
  readonly type: ContractType;

  @ApiPropertyOptional({
    description:
      'Boolean which determines whether controller can be change or not',
  })
  readonly immutableController?: boolean;

  @ApiProperty({
    description: 'Visibility of contract',
    enum: ContractVisibility,
  })
  readonly visibility: ContractVisibility;

  @ApiPropertyOptional({
    description:
      'The only wallet that can manage the Recipients can manage in the case of a mutable contract',
  })
  readonly controller?: ContractAnonymousUserDto;

  @ApiPropertyOptional({
    description:
      'List of wallets that can manually initiate a redistribution of the funds accumulated in a contract',
  })
  readonly distributors?: ContractAnonymousUserDto[];

  @ApiPropertyOptional({
    description: 'Acceptable contract currencies',
    type: () => [ContractCurrencyDto],
  })
  readonly currencies?: ContractCurrencyDto[];

  @ApiPropertyOptional({
    description: 'Is it possible to change the recipient of the contract',
  })
  readonly isRecipientsLocked?: boolean;

  @ApiPropertyOptional({
    description: 'Recipients of funds transferred to the contract',
    type: () => [ValveV1RecipientDto],
  })
  readonly recipients?: ValveV1RecipientDto[];

  @ApiPropertyOptional({
    description: 'Distribution of funds transferred to the contract',
    enum: ValveV1DistributionType,
  })
  readonly distribution?: ValveV1DistributionType;

  @ApiPropertyOptional({
    description:
      'Boolean which determines whether native currency send to contract should be automatically distributed',
  })
  readonly autoNativeCurrencyDistribution?: boolean;

  @ApiPropertyOptional({
    description:
      'Threshold - an amount represents how much ETH has to be send to contract to be automatically distributed',
  })
  readonly minAutoDistributionAmount?: number;

  @ApiProperty({ description: 'Contract creation date' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Contract last update date' })
  readonly updatedAt: Date;

  @ApiPropertyOptional({ description: 'Contract published date' })
  readonly publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Contract legal agreement url' })
  readonly legalAgreementUrl?: string;

  @ApiPropertyOptional({ description: 'Contract visualization url' })
  readonly visualizationUrl?: string;
}
