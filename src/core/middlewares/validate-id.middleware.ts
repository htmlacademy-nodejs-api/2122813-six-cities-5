import {Types} from 'mongoose';
import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';

import HttpError from '../errors/http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

export class ValidateObjectIdMiddleware implements MiddlewareInterface {
  constructor(private parameterName: string) {}

  public execute({params}: Request, _res: Response, next: NextFunction): void {
    const objectId = params[this.parameterName];

    if (Types.ObjectId.isValid(objectId)) {
      return next();
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `${objectId} is invalid ObjectID`,
      'Incorrect path Error. Check your request.'
    );
  }
}
