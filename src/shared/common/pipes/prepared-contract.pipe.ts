import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  PreparedContractType,
  PreparedContractsDtoConfigMap,
  WrappablePreparedContract,
} from '../../../api/contracts/dto';
import {
  ApiErrorDto,
  ValidationApiErrorItemDto,
} from '../../../api/generic/dto';

@Injectable()
export class PreparedContractPipe
  implements PipeTransform<PreparedContractType>
{
  private readonly logger = new Logger(PreparedContractPipe.name);

  async transform(
    value: PreparedContractType | unknown,
    metadata: ArgumentMetadata,
  ): Promise<WrappablePreparedContract<PreparedContractType> | unknown> {
    if (metadata.type !== 'body') {
      return value;
    }
    const preparedContractType = value as PreparedContractType;
    this.logger.debug(JSON.stringify(preparedContractType));

    let transformed: PreparedContractType;

    if (
      PreparedContractsDtoConfigMap[preparedContractType.type] &&
      PreparedContractsDtoConfigMap[preparedContractType.type][
        preparedContractType.version
      ]
    )
      transformed = plainToInstance(
        PreparedContractsDtoConfigMap[preparedContractType.type][
          preparedContractType.version
        ],
        preparedContractType,
      );
    else {
      const apiErrorDto: ApiErrorDto = {
        message: 'Invalid contract',
        errors: [
          {
            message: `Unsupported version ${preparedContractType.version} for ${preparedContractType.type}`,
          },
        ],
      };
      throw new BadRequestException(apiErrorDto);
    }

    const errors = await validate(transformed);
    if (errors.length > 0) {
      const apiErrorDto: ApiErrorDto = {
        message: 'Invalid fields',
        errors: this.wrapValidationErrorsToApiErrors(errors, []),
      };
      throw new BadRequestException(apiErrorDto);
    }

    return preparedContractType;
  }

  private wrapValidationErrorsToApiErrors(
    validationErrors: ValidationError[],
    validationApiErrors: ValidationApiErrorItemDto[],
    parent?: string,
  ): ValidationApiErrorItemDto[] {
    parent = parent ?? '';

    validationErrors.forEach((error) => {
      const errorChildren = error.children;
      const property = `${parent}${error.property}`;

      errorChildren && errorChildren.length !== 0
        ? this.wrapValidationErrorsToApiErrors(
            errorChildren,
            validationApiErrors,
            `${property}.`,
          )
        : validationApiErrors.push({
            invalidField: property,
            message: Object.values(error.constraints).join(', '),
          });
    });

    return validationApiErrors;
  }
}
