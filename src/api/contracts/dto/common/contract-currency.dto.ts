import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate } from 'class-validator';
import { IsEthereumAddressIfRequired } from '../../../../shared/common/validator-constraints';

export enum NativeBlockchainCurrency {
  ETH = 'ETH',
  MATIC = 'MATIC',
  BNB = 'BNB',
}

export class ContractCurrencyDto {
  @IsString()
  @ApiProperty({
    description: 'Currency name',
  })
  readonly title: string | NativeBlockchainCurrency;

  @Validate(IsEthereumAddressIfRequired)
  @ApiProperty({
    description: 'Currency chain address, should be null for native currency',
  })
  readonly address: string;
}
