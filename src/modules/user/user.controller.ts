import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';

import { Controller } from '../../core/controller/controller.abstract.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { UserServiceInterface } from './user-service.interface.js';
import { StatusCodes } from 'http-status-codes';
import { createSHA256, fillRDO } from '../../core/utils/common.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import NewUserRDO from './rdo/new-user.rdo.js';
import RentOfferService from '../rent-offer/rent-offer.service.js';
import RentOfferBasicRDO from '../rent-offer/rdo/rent-offer-basic.rdo.js';
import CreateUserDTO from './dto/create-user.dto.js';
import HttpError from '../../core/errors/http-error.js';

@injectable()
export default class UserController extends Controller {
  constructor(
  @inject(AppComponent.LoggerInterface) logger: LoggerInterface,
  @inject(AppComponent.UserServiceInterface) private readonly userService: UserServiceInterface,
  @inject(AppComponent.RentOfferServiceInterface) private readonly rentOfferService: RentOfferService,
  @inject(AppComponent.ConfigInterface) private readonly configService: ConfigInterface<RestSchema>
  ) {
    super(logger);

    this.logger.info('Register routes for User Controller…');

    this.addRoute({path: '/register', method: HttpMethod.Post, handler: this.register});
    this.addRoute({path: '/auth', method: HttpMethod.Get, handler: this.checkAuth});
    this.addRoute({path: '/auth', method: HttpMethod.Post, handler: this.requestAuth});
    this.addRoute({path: '/logout', method: HttpMethod.Delete, handler: this.logout});
    this.addRoute({path: '/:userId/avatar', method: HttpMethod.Put, handler: this.loadAvatar});
    this.addRoute({path: '/:userId/favorites/:offerId', method: HttpMethod.Put, handler:this.updateFavoriteStatus});
    this.addRoute({path: '/:userId/favorites/', method: HttpMethod.Get, handler:this.getFavorites});
  }

  public async register(req: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDTO>, res: Response): Promise<void> {
    const {body: registerData} = req;

    const existUser = await this.userService.findByEmail(registerData.email);

    if (existUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        'User with such email already exists. Please enter another email.',
        'UserController'
      );
    }

    const newUser = await this.userService.create(registerData, this.configService.get('SALT'));
    this.created(res, fillRDO(NewUserRDO, newUser));
  }

  public checkAuth(req: Request, _res: Response): void {
    const reqToken = req.get('X-token');

    if (!reqToken) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Request Error - Bad token.',
        'UserController'
      );
    }
  }

  public async requestAuth(req: Request, _res: Response): Promise<void> {
    const {body: {email, password}} = req;
    const existUser = await this.userService.findByEmail(email);

    if (!existUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email ${email} doesn't exist.`,
        'UserController'
      );
    }

    const encryptPassword = createSHA256(password, this.configService.get('SALT'));

    if (encryptPassword !== existUser.getPassword()) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wrong password.',
        'UserController'
      );
    }
  }

  public async loadAvatar(_req: Request, _res: Response): Promise<void> {
    throw new Error('Ещё не реализован');
  }

  public async logout(req: Request, _res: Response): Promise<void> {
    const reqToken = req.get('X-token');

    if (!reqToken) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Request Error - Bad token.',
        'UserController'
      );
    }
  }

  public async updateFavoriteStatus(req: Request, res: Response): Promise<void> {
    if(!Object.keys(req.params).includes('userId') ||
      !Object.keys(req.params).includes('offerId') ||
      !Object.keys(req.query).includes('isFav')) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'UserController'
      );
    }

    const {params: {userId, offerId}, query: {isFav}} = req;

    if (!userId || !offerId || !isFav) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'UserController'
      );
    }

    const existOffer = await this.rentOfferService.findById(offerId);
    if (!existOffer) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        'Offer with such id not found',
        'UserController'
      );
    }

    const status = Number.parseInt(isFav.toString(), 10) === 1;
    const updateUser = await this.userService.changeFavoriteStatus(userId, existOffer.id, status);
    this.send(res, 201, updateUser);
  }

  public async getFavorites(req: Request, res: Response): Promise<void> {
    if(!Object.keys(req.params).includes('userId')) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'UserController'
      );
    }

    const {params: {userId}} = req;

    const existedUserFavorites = await this.userService.findUserFavorites(userId);
    const favoritesResponse = existedUserFavorites?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, favoritesResponse);
  }
}
