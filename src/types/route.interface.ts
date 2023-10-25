import type { NextFunction, Request, Response } from 'express';

import {HttpMethod} from './http-method.type.js';
import { MiddlewareInterface } from '../core/middlewares/middleware.interface.js';

export interface RouteInterface {
  path: string;
  method: HttpMethod;
  handler: (req: Request, res: Response, next: NextFunction) => void;
  middlewares?: MiddlewareInterface[];
}
