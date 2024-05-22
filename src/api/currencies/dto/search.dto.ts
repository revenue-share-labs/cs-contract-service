import { ApiPropertyOptional } from '@nestjs/swagger';
import { Chain } from '@prisma/client';

export class SearchCurrenciesDto {
  @ApiPropertyOptional({
    description: 'Name of currency',
  })
  readonly title?: string;
  @ApiPropertyOptional({
    enum: Chain,
    isArray: true,
    description: 'Blockchain of currency',
  })
  readonly chain?: Chain[];
}
