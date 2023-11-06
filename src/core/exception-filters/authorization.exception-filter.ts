import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';

import { ExceptionFilterInterface } from './exception-filter.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { ErrorType } from '../../types/error-type.type.js';
import { createErrorObject } from '../utils/common.js';
import AuthError from '../errors/auth-error.js';

@injectable()
export default class AuthorizationExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface
  ) {
    this.logger.info('Register AuthorizationExceptionFilter');
  }

  public catch(error: unknown, req: Request, res: Response, next: NextFunction): void {
    if (!(error instanceof AuthError)) {
      return next(error);
    }

    this.logger.error(`[AuthErrorException]: ${req.path} # ${error.message}`);

    res
      .status(error.httpStatusCode)
      .json(createErrorObject(ErrorType.AuthError, error.message));
  }
}
