import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType, Chain, ContractVisibility } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../../../generic/dto';

export enum DateEpochEnum {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  PUBLISHED = 'PUBLISHED',
}

export enum RecipientsStatus {
  LOCKED = 'LOCKED',
  EDITABLE = 'EDITABLE',
}

export enum ParticipantStatus {
  AUTHOR = 'AUTHOR',
  OWNER = 'OWNER',
  RECIPIENT = 'RECIPIENT',
  CONTROLLER = 'CONTROLLER',
  DISTRIBUTOR = 'DISTRIBUTOR',
}

export class SearchContractsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User internal id',
  })
  readonly author?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Name of a RSC contract. A contract name is self-explanatory and is needed to easily differentiate between two or more SC. A contract name is publicly visible',
  })
  readonly title?: string;

  @IsEnum(SortOrder)
  @IsOptional()
  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Title sort order',
    default: SortOrder.asc,
  })
  readonly titleSortOrder: SortOrder = SortOrder.asc;

  @IsEnum(Chain, { each: true })
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    enum: Chain,
    isArray: true,
    description: 'Blockchain on which the contract will be deployed',
  })
  readonly chain?: Chain[];

  @IsEnum(SortOrder)
  @IsOptional()
  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Date sort order',
  })
  readonly dateSortOrder?: SortOrder;

  @IsEnum(DateEpochEnum, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    default: DateEpochEnum.CREATED,
    enum: DateEpochEnum,
    description: 'Epoch date specification',
  })
  readonly epoch?: DateEpochEnum;

  @IsEnum(ContractType, { each: true })
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    enum: ContractType,
    isArray: true,
    description: 'Type of contract: VALVE etc.',
  })
  readonly type?: ContractType[];

  @IsEnum(ContractVisibility, { each: true })
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    enum: ContractVisibility,
    isArray: true,
    description: 'Visibility of contract',
  })
  readonly visibility?: ContractVisibility[];

  @IsEnum(RecipientsStatus, { each: true })
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    enum: RecipientsStatus,
    isArray: true,
    description: 'Recipients status',
  })
  readonly recipientsStatus?: RecipientsStatus[];

  @IsEnum(ParticipantStatus, { each: true })
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    enum: ParticipantStatus,
    isArray: true,
    description: 'Participant status',
  })
  readonly participantStatus?: ParticipantStatus[];
}
