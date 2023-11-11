import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';

import { ExceptionFilterInterface } from './exception-filter.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import HttpError from '../errors/http-error.js';
import { AppComponent } from '../../types/app-component.type.js';
import { ErrorType } from '../../types/error-type.type.js';
import { createErrorObject } from '../utils/common.js';

@injectable()
export default class HttpErrorExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface
  ) {
    this.logger.info('Register HttpErrorExceptionFilter');
  }

  public catch(error: unknown, req: Request, res: Response, next: NextFunction): void {
    if (!(error instanceof HttpError)) {
      return next(error);
    }

    this.logger.error(`[HttpErrorException]: ${req.path} # ${error.message}`);

    res
      .status(error.httpStatusCode)
      .json(createErrorObject(ErrorType.HTTPError, error.message));
  }
}
