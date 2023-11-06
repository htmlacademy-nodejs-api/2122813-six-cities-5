import {NextFunction, Request, Response} from 'express';
import {ClassConstructor} from 'class-transformer/types/interfaces/class-constructor.type.js';
import {validate} from 'class-validator';
import {plainToInstance} from 'class-transformer';

import { MiddlewareInterface } from './middleware.interface.js';
import { transformErrors } from '../utils/common.js';
import ValidationError from '../errors/validation-error.js';


export class ValidateDTOMiddleware implements MiddlewareInterface {
  constructor(private DTO: ClassConstructor<object>) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const {body} = req;
    const DTOinstance = plainToInstance(this.DTO, body);
    const errors = await validate(DTOinstance, { validationError: { target: false } });

    if (errors.length > 0) {
      throw new ValidationError(`Validation error: "${req.path}"`, transformErrors(errors));
    }

    next();
  }
}
