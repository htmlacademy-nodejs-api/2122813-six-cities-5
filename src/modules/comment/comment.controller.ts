import { inject } from 'inversify';
import { Request, Response } from 'express';
import {ParamsDictionary } from 'express-serve-static-core';

import { Controller } from '../../core/controller/controller.abstract.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { CommentServiceInterface } from './comment-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { RentOfferServiceInterface } from '../rent-offer/rent-offer-service.interface.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import CreateCommentDTO from './dto/create-comment.dto.js';
import HttpError from '../../core/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { fillRDO } from '../../core/utils/common.js';
import CommentRDO from './rdo/comment.rdo.js';
import { ValidateDTOMiddleware } from '../../core/middlewares/validate-dto.middleware.js';
import { ResBody } from '../../types/default-response.type.js';
import { PrivateRouteMiddleware } from '../../core/middlewares/private-route.middleware.js';

export default class CommentController extends Controller {
  constructor(
    @inject(AppComponent.LoggerInterface) logger: LoggerInterface,
    @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
    @inject(AppComponent.RentOfferServiceInterface) private readonly offerService: RentOfferServiceInterface,
  ) {
    super(logger);
    this.logger.info('Register routes for CommentController…');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDTOMiddleware(CreateCommentDTO)
      ]
    });
  }

  public async create({body: commentData}: Request<ParamsDictionary, ResBody, CreateCommentDTO>, res: Response): Promise<void> {

    if (!await this.offerService.exists(commentData.offerId)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Offer with such id ${commentData.offerId} not exists.`,
        'CommentController'
      );
    }
    const author = res.locals.user;
    const comment = await this.commentService.create({...commentData, authorId: author.id});
    await this.offerService.incCommentCount(commentData.offerId);
    await this.offerService.updateRating(commentData.offerId);
    this.created(res, fillRDO(CommentRDO, comment));
  }
}
