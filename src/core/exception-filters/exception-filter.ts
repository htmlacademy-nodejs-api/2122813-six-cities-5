import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';

import { ExceptionFilterInterface } from './exception-filter.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import HttpError from '../errors/http-error.js';
import { createErrorObject } from '../utils/common.js';

@injectable()
export default class ExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface
  ) {
    this.logger.info('Register ExceptionFilter');
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response, _next: NextFunction) {
    const {message, httpStatusCode, details} = error;
    this.logger.error(`[${details}]: ${httpStatusCode} — ${message}`);
    res
      .status(httpStatusCode)
      .json(createErrorObject(message));
  }

  private handleOtherError(error: Error, _req: Request, res: Response, _next: NextFunction) {
    const { message } = error;
    this.logger.error(message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createErrorObject(message));
  }

  public catch(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res, next);
    }

    return this.handleOtherError(error, req, res, next);
  }
}
