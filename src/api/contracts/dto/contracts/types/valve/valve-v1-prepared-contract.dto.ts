import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Chain,
  ContractStatus,
  ContractType,
  ContractVisibility,
} from '@prisma/client';
import { ValveV1RecipientDto } from './valve-v1-recipient.dto';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsEthereumAddress,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractAnonymousUserDto } from '../../../common/contract-anonymous-user.dto';
import { ContractCurrencyDto } from '../../../common/contract-currency.dto';

export enum ValveV1DistributionType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export class ValveV1ContractPreparedDto {
  @IsString()
  @ApiProperty({
    description:
      'Name of a RSC contract. A contract name is self-explanatory and is needed to easily differentiate between two or more SC. A contract name is publicly visible',
  })
  readonly title: string;

  @IsString()
  @IsOptional()
  @MaxLength(256)
  @ApiPropertyOptional({
    description: 'Contract description',
  })
  readonly description?: string;

  @IsString()
  @ApiProperty({
    description: 'Version of contract',
  })
  readonly version: string;

  @IsEnum(Chain)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Blockchain on which the contract will be deployed',
    enum: Chain,
  })
  readonly chain?: Chain;

  @IsEnum(ContractType)
  @ApiProperty({
    description: 'Type of contract: VALVE, PREPAYMENT, WATERFALL etc.',
    enum: ContractType,
  })
  readonly type: ContractType;

  // TODO: remove after contract monitoring will be available, only for Alpha
  @IsEnum(ContractStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Contract status of deployment, if not defined status will be set as DRAFT by default',
    enum: ContractStatus,
  })
  status?: ContractStatus;

  // TODO: remove after contract monitoring will be available, only for Alpha
  @IsOptional()
  @IsEthereumAddress()
  @ApiPropertyOptional({
    description:
      'Contract chain address, can be editable only for owner while contract in status=DRAFT/PENDING',
  })
  address?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Boolean which determines whether controller can be change or not',
  })
  readonly immutableController?: boolean;

  @IsEnum(ContractVisibility)
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Visibility of contract, if not defined visibility will be set as PRIVATE by default',
    enum: ContractVisibility,
    default: ContractVisibility.PRIVATE,
  })
  readonly visibility?: ContractVisibility;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractAnonymousUserDto)
  @ApiPropertyOptional({
    description:
      'The only wallet that can manage the Recipients can manage in the case of a mutable contract',
  })
  readonly controller?: ContractAnonymousUserDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContractAnonymousUserDto)
  @ApiPropertyOptional({
    description:
      'List of wallets that can manually initiate a redistribution of the funds accumulated in a contract',
    type: () => [ContractAnonymousUserDto],
  })
  readonly distributors?: ContractAnonymousUserDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContractCurrencyDto)
  @ApiPropertyOptional({
    description: 'Acceptable contract currencies',
    type: () => [ContractCurrencyDto],
  })
  readonly currencies?: ContractCurrencyDto[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Is it possible to change the recipient of the contract',
  })
  readonly isRecipientsLocked?: boolean;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ValveV1RecipientDto)
  @ApiPropertyOptional({
    description: 'Recipients of funds transferred to the contract',
    type: () => [ValveV1RecipientDto],
  })
  readonly recipients?: ValveV1RecipientDto[];

  @IsEnum(ValveV1DistributionType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Distribution of funds transferred to the contract',
    enum: ValveV1DistributionType,
  })
  readonly distribution?: ValveV1DistributionType;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Boolean which determines whether native currency send to contract should be automatically distributed',
  })
  readonly autoNativeCurrencyDistribution?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({
    description:
      'Threshold - an amount represents how much ETH has to be send to contract to be automatically distributed',
    minimum: 0,
  })
  readonly minAutoDistributionAmount?: number;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Contract legal agreement url',
  })
  readonly legalAgreementUrl?: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Contract visualization url',
  })
  readonly visualizationUrl?: string;
}
