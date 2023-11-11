import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';

import { ExceptionFilterInterface } from './exception-filter.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import ValidationError from '../errors/validation-error.js';
import { AppComponent } from '../../types/app-component.type.js';
import { createErrorObject } from '../utils/common.js';
import { ErrorType } from '../../types/error-type.type.js';


@injectable()
export default class ValidationExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface
  ) {
    this.logger.info('Register ValidationExceptionFilter');
  }

  public catch(error: unknown, _req: Request, res: Response, next: NextFunction): void {
    if (!(error instanceof ValidationError)) {
      return next(error);
    }

    const {message, httpStatusCode, details} = error;

    this.logger.error(`[ValidationException]: ${error.message}`);

    error.details.forEach(
      ({field, messages}) => this.logger.error(`[${field}] — ${messages}`)
    );

    res
      .status(httpStatusCode)
      .json(createErrorObject(ErrorType.ValidationError, message, details));
  }
}
