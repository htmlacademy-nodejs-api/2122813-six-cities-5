import {NextFunction, Request, Response} from 'express';
import {ClassConstructor} from 'class-transformer/types/interfaces/class-constructor.type.js';
import {validate} from 'class-validator';
import {StatusCodes} from 'http-status-codes';
import {plainToInstance} from 'class-transformer';
import { MiddlewareInterface } from './middleware.interface.js';

export class ValidateDTOMiddleware implements MiddlewareInterface {
  constructor(private DTO: ClassConstructor<object>) {}

  public async execute({body}: Request, res: Response, next: NextFunction): Promise<void> {
    const DTOinstance = plainToInstance(this.DTO, body);
    const errors = await validate(DTOinstance, { validationError: { target: false } });

    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).send(errors);
      return;
    }

    next();
  }
}
