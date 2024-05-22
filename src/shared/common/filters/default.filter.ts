import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorDto } from '../../../api/generic/dto';

@Catch(Error)
export class DefaultFilter implements ExceptionFilter {
  private readonly logger = new Logger(DefaultFilter.name);

  catch(err: Error, host: ArgumentsHost): void {
    this.logger.debug(err);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (err instanceof HttpException) {
      const apiErrorDto = err.getResponse() as ApiErrorDto;
      response
        .status(err.getStatus())
        .json({ message: apiErrorDto.message, errors: apiErrorDto.errors });
    } else {
      this.logger.error(err);
      response
        .status(500)
        .json({ message: 'Something went wrong', errors: [] });
    }
  }
}
