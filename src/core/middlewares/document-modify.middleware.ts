import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import HttpError from '../errors/http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';
import { DocumentModifyInterface } from '../../types/document-modify.interface.js';

export class DocumentModifyMiddleware implements MiddlewareInterface {
  constructor(
    private readonly service: DocumentModifyInterface,
    private readonly entityName: string,
    private readonly paramName: string,
  ) {}

  public async execute({params}: Request, res: Response, next: NextFunction): Promise<void> {
    const documentId = params[this.paramName];
    const owner = res.locals.user;
    if (!await this.service.canModify(owner.id, documentId)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `You can't modify ${this.entityName} with ${documentId}.`,
        'DocumentModifyMiddleware'
      );
    }

    next();
  }
}
