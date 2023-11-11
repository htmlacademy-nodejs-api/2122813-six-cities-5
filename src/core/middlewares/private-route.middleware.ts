import { NextFunction, Request, Response } from 'express';

import { MiddlewareInterface } from './middleware.interface.js';
import AuthError from '../errors/auth-error.js';

export class PrivateRouteMiddleware implements MiddlewareInterface {
  public async execute(_req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!res.locals.user) {
      throw new AuthError(
        'This section allowed only for authorized users',
        'PrivateRouteMiddleware'
      );
    }
    return next();
  }
}
