import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {ParamsDictionary } from 'express-serve-static-core';

import { Controller } from '../../core/controller/controller.abstract.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { HttpMethod } from '../../types/http-method.type.js';
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
import { MAX_COMMENTS_COUNT } from '../comment/comment.constants.js';
import UpdateRentOfferDTO from './dto/update-rent-offer.dto.js';
import { DocumentExistsMiddleware } from '../../core/middlewares/document-exists.middleware.js';
import { ResBody } from '../../types/default-response.type.js';
import { PrivateRouteMiddleware } from '../../core/middlewares/private-route.middleware.js';
import { CityNames } from '../../types/city.type.js';
import { DocumentModifyMiddleware } from '../../core/middlewares/document-modify.middleware.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import UserService from '../user/user.service.js';

type ParamsOfferDetails = {
  offerId: string;
} | ParamsDictionary;
@injectable()
export default class RentOfferController extends Controller {
  constructor(
  @inject(AppComponent.LoggerInterface) protected readonly logger: LoggerInterface,
  @inject(AppComponent.RentOfferServiceInterface) private readonly rentOfferService: RentOfferService,
  @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentService,
  @inject(AppComponent.UserServiceInterface) private readonly userService: UserService,
  @inject(AppComponent.ConfigInterface) protected readonly configService: ConfigInterface<RestSchema>
  ) {
    super(logger, configService);
    this.logger.info('Register routes for Rent Offer Controller…');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.createOffer,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDTOMiddleware(CreateRentOfferDTO)
      ]
    });
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.getOffers});
    this.addRoute({path: '/premium', method: HttpMethod.Get, handler: this.getPremiumOffers});
    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler:this.getFavorites,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getOfferDetails,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDTOMiddleware(UpdateRentOfferDTO),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId'),
        new DocumentModifyMiddleware(this.rentOfferService, 'Rent-offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler:this.deleteOffer,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId'),
        new DocumentModifyMiddleware(this.rentOfferService, 'Rent-offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId')
      ]
    });
  }

  public async createOffer({body: offerData}: Request<ParamsDictionary, ResBody, CreateRentOfferDTO>, res: Response): Promise<void> {
    const advertiser = res.locals.user;
    const newOffer = await this.rentOfferService.create({...offerData, advertiserId: advertiser.id});
    this.created(res, fillRDO(RentOfferFullRDO, newOffer));
  }

  public async getOffers({query: {count}}: Request<ParamsDictionary>, res: Response): Promise<void> {
    const offersCount = (count && !Number.isNaN(Number.parseInt(count.toString(), 10))) ? Number.parseInt(count.toString(), 10) : DEFAULT_OFFERS_COUNT;
    const userId = res.locals.user ? res.locals.user.id : '';
    const offers = await this.rentOfferService.find(offersCount, userId);
    const offersResponse = offers?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, offersResponse);
  }

  public async getPremiumOffers({query: {city}}: Request, res: Response): Promise<void> {

    if (!city || !Object.values(CityNames).map((cityName) => cityName.toString()).includes(city.toString())) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Incorrect path Error. Can't get offer from ${city}`,
        'RentOfferController'
      );
    }

    const userId = res.locals.user ? res.locals.user.id : '';
    const premiumOffers = await this.rentOfferService.findPremium(city.toString(), MAX_PREMIUM_OFFERS_COUNT, userId);
    const offersResponse = premiumOffers?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, offersResponse);
  }

  public async getOfferDetails({params: {offerId}}: Request<ParamsOfferDetails>, res: Response): Promise<void> {
    const userId = res.locals.user ? res.locals.user.id : '';
    const offer = await this.rentOfferService.findById(offerId, userId);
    this.ok(res, fillRDO(RentOfferFullRDO, offer));
  }

  public async updateOffer({body: updateData, params: {offerId}}: Request<ParamsOfferDetails, ResBody, UpdateRentOfferDTO>, res: Response): Promise<void> {
    const updatedOffer = await this.rentOfferService.updateById(offerId, updateData);
    this.ok(res, fillRDO(RentOfferFullRDO, updatedOffer));
  }

  public async deleteOffer({params: {offerId}}: Request<ParamsOfferDetails>, res: Response): Promise<void> {
    const offer = await this.rentOfferService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);
    await this.userService.deleteOfferFromUsersFavorites(offerId);
    this.noContent(res, offer);
  }

  public async getComments({params: {offerId}}: Request<ParamsOfferDetails>, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(offerId, MAX_COMMENTS_COUNT);
    this.ok(res, fillRDO(CommentRDO, comments));
  }

  public async getFavorites(_req: Request, res: Response): Promise<void> {
    const userId = res.locals?.user?.id;
    const existedUserFavorites = await this.rentOfferService.findUserFavorites(userId);
    const favoritesResponse = existedUserFavorites?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, favoritesResponse);
  }
}
