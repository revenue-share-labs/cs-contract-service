import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ApiErrorItemDto } from './api-error-item.dto';
import { ValidationApiErrorItemDto } from './validation-api-error-item.dto';

export type ApiErrorItem = ApiErrorItemDto | ValidationApiErrorItemDto;

@ApiExtraModels(ApiErrorItemDto, ValidationApiErrorItemDto)
export class ApiErrorDto {
  @ApiProperty({
    description: 'Error message',
  })
  readonly message: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ApiErrorItemDto) },
        { $ref: getSchemaPath(ValidationApiErrorItemDto) },
      ],
    },
  })
  readonly errors?: ApiErrorItem[];
}
