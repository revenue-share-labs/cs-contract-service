import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress } from 'class-validator';

export class ContractAnonymousUserDto {
  @IsString()
  @ApiProperty({
    description: 'User name',
  })
  readonly name: string;

  @IsEthereumAddress()
  @ApiProperty({
    description: 'User chain address',
  })
  readonly address: string;
}
