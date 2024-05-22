import { ApiProperty } from '@nestjs/swagger';
import { Chain } from '@prisma/client';

export class CurrencyLocationDto {
  @ApiProperty({
    description: 'Currency on-chain address',
  })
  readonly address: string;
  @ApiProperty({
    description: 'Blockchain of currency',
    enum: Chain,
  })
  readonly chain: Chain;
}

export class CurrencyDto {
  @ApiProperty({
    description: 'Currency internal id',
  })
  readonly id: string;
  @ApiProperty({
    description: 'Name of currency',
  })
  readonly title: string;
  @ApiProperty({
    description: 'List of currency parameters for each blockchain',
    type: () => [CurrencyLocationDto],
  })
  readonly locations: CurrencyLocationDto[];
  @ApiProperty({ description: 'Currency creation date' })
  readonly createdAt: Date;
  @ApiProperty({ description: 'Currency last update date' })
  readonly updatedAt: Date;
}
