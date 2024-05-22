import { ApiProperty } from '@nestjs/swagger';

export class ValveV1ContractOwnerDto {
  @ApiProperty({
    description: 'Owner chain address',
  })
  readonly address: string;

  @ApiProperty({
    description: 'Owner revenue',
  })
  readonly revenue: number;
}
