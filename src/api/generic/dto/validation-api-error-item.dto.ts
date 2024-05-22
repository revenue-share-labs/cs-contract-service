import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorItemDto } from './api-error-item.dto';

export class ValidationApiErrorItemDto extends ApiErrorItemDto {
  @ApiProperty({
    description: 'Field that was failed during validation',
  })
  readonly invalidField: string;
}
