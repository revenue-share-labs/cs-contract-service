import { ApiProperty } from '@nestjs/swagger';
import { ContractAnonymousUserDto } from '../../../common/contract-anonymous-user.dto';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ValveV1RecipientDto extends ContractAnonymousUserDto {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'User revenue',
    minimum: 0,
  })
  readonly revenue: number;
}
