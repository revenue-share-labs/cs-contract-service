import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorItemDto {
  @ApiProperty({
    description: 'Error item message',
  })
  readonly message: string;

  @ApiPropertyOptional({
    description: 'Error item code',
  })
  readonly errorCode?: string;
}
