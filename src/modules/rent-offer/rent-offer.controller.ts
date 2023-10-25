import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Controller } from '../../core/controller/controller.abstract.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { StatusCodes } from 'http-status-codes';
import { fillRDO } from '../../core/utils/common.js';
import RentOfferService from '../rent-offer/rent-offer.service.js';
import RentOfferBasicRDO from '../rent-offer/rdo/rent-offer-basic.rdo.js';
import { RentOfferFullRDO } from './rdo/rent-offer-full.rdo.js';
import HttpError from '../../core/errors/http-error.js';
import { DEFAULT_OFFERS_COUNT, MAX_PREMIUM_OFFERS_COUNT } from './rent-offer.constants.js';
import CreateRentOfferDTO from './dto/create-rent-offer.dto.js';
import CommentService from '../comment/comment.service.js';
import CommentRDO from '../comment/rdo/comment.rdo.js';
import { ValidateObjectIdMiddleware } from '../../core/middlewares/validate-id.middleware.js';
import { ValidateDTOMiddleware } from '../../core/middlewares/validate-dto.middleware.js';
import UpdateRentOfferDTO from './dto/update-rent-offer.dto.js';
import { MAX_COMMENTS_COUNT } from '../comment/comment.constants.js';

type ParamsGetOffer = {
  offerId: string;
}

@injectable()
export default class RentOfferController extends Controller {
  constructor(
  @inject(AppComponent.LoggerInterface) logger: LoggerInterface,
  @inject(AppComponent.RentOfferServiceInterface) private readonly rentOfferService: RentOfferService,
  @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentService
  ) {
    super(logger);

    this.logger.info('Register routes for Rent Offer Controller…');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.createOffer,
      middlewares: [new ValidateDTOMiddleware(CreateRentOfferDTO)]
    });
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.getOffers});
    this.addRoute({path: '/premium', method: HttpMethod.Get, handler: this.getPremiumOffers});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getOfferDetails,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDTOMiddleware(UpdateRentOfferDTO)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler:this.deleteOffer,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
  }

  public async createOffer(req: Request<Record<string, unknown>, Record<string, unknown>, CreateRentOfferDTO>, res: Response): Promise<void> {
    const reqToken = req.get('X-token');
    if (!reqToken) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. Only for authorized users.',
        'RestOfferController'
      );
    }
    const {body: requestOffer} = req;
    const newOffer = await this.rentOfferService.create(requestOffer);
    this.created(res, fillRDO(RentOfferFullRDO, newOffer));
  }

  public async getOffers(req: Request, res: Response): Promise<void> {
    const {params: {count}} = req;
    const offersCount = count ? Number.parseInt(count, 10) : DEFAULT_OFFERS_COUNT;

    const offers = await this.rentOfferService.find(offersCount, '64760b2a6a803a09ab8e9a34');
    console.log(offers);

    const offersResponse = offers?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, offersResponse);
  }

  public async getPremiumOffers(req: Request, res: Response): Promise<void> {
    const {query: {city}} = req;
    if (!city) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'RestOfferController'
      );
    }
    const premiumOffers = await this.rentOfferService.findPremium(city.toString(), MAX_PREMIUM_OFFERS_COUNT, '64760b2a6a803a09ab8e9a34');
    const offersResponse = premiumOffers?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, offersResponse);
  }

  public async getOfferDetails({params}: Request<core.ParamsDictionary| ParamsGetOffer>, res: Response): Promise<void> {
    const {offerId} = params;
    if (!offerId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'RestOfferController'
      );
    }


    const offer = await this.rentOfferService.findById(offerId, '64760b2a6a803a09ab8e9a34');
    this.ok(res, fillRDO(RentOfferFullRDO, offer));
  }

  public async updateOffer(req: Request, res: Response): Promise<void> {
    const reqToken = req.get('X-token');
    if (!reqToken) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. Only for authorized users.',
        'RestOfferController'
      );
    }
    const {params: {offerId}, body: updateData} = req;
    if (!offerId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'RestOfferController'
      );
    }
    const updatedOffer = await this.rentOfferService.updateById(offerId, updateData);
    if (!updatedOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }
    this.ok(res, fillRDO(RentOfferFullRDO, updatedOffer));
  }

  public async deleteOffer(req: Request, res: Response): Promise<void> {
    const reqToken = req.get('X-token');
    if (!reqToken) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. Only for authorized users.',
        'RestOfferController'
      );
    }
    const {params: {offerId}} = req;
    if (!offerId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'RestOfferController'
      );
    }
    const offer = await this.rentOfferService.deleteById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Offer with such id ${offerId} not exists.`,
        'OfferController'
      );
    }
    await this.commentService.deleteByOfferId(offerId);

    this.noContent(res, {message: 'Offer was deleted successfully.'});
  }

  public async getComments({params}: Request<core.ParamsDictionary | ParamsGetOffer>, res: Response): Promise<void> {

    if (!await this.rentOfferService.exists(params.offerId)) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Offer with such id ${params.offerId} not exists.`,
        'OfferController'
      );
    }

    const comments = await this.commentService.findByOfferId(params.offerId, MAX_COMMENTS_COUNT);
    this.ok(res, fillRDO(CommentRDO, comments));
  }
}
