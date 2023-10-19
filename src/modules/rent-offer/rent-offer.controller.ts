import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';

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

@injectable()
export default class RentOfferController extends Controller {
  constructor(
  @inject(AppComponent.LoggerInterface) logger: LoggerInterface,
  @inject(AppComponent.RentOfferServiceInterface) private readonly rentOfferService: RentOfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for Rent Offer Controller…');

    this.addRoute({path: '/', method: HttpMethod.Post, handler: this.createOffer});
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.getOffers});
    this.addRoute({path: '/premium', method: HttpMethod.Get, handler: this.getPremiumOffers});
    this.addRoute({path: '/:offerId', method: HttpMethod.Get, handler: this.getOfferDetails});
    this.addRoute({path: '/:offerId', method: HttpMethod.Put, handler: this.updateOffer});
    this.addRoute({path: '/:offerId', method: HttpMethod.Delete, handler:this.deleteOffer});
  }

  public async createOffer(req: Request, res: Response): Promise<void> {

    const reqToken = req.get('X-token');

    if (!reqToken) {
      const errorMessage = 'Access denied. Only for authorized users.';
      this.send(res, 401, {error: errorMessage});
      return this.logger.error(errorMessage);
    }

    const {body: requestOffer} = req;

    const newOffer = await this.rentOfferService.create(requestOffer);
    this.created(res, fillRDO(RentOfferFullRDO, newOffer));
  }

  public async getOffers(req: Request, res: Response): Promise<void> {

    const {params: {count}} = req;

    const offers = await this.rentOfferService.find(Number.parseInt(count, 10));

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

    const premiumOffers = await this.rentOfferService.findPremium(city.toString());

    const offersResponse = premiumOffers?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, offersResponse);
  }

  public async getOfferDetails(req: Request, res: Response): Promise<void> {
    const {params: {offerId}} = req;

    if (!offerId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'RestOfferController'
      );
    }

    const offer = await this.rentOfferService.findById(offerId);
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

    await this.rentOfferService.deleteById(offerId);
    this.noContent(res, {message: 'Offer was deleted successfully.'});
  }

}
