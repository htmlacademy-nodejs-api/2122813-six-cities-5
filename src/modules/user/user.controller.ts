import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { Controller } from '../../core/controller/controller.abstract.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { UserServiceInterface } from './user-service.interface.js';
import { StatusCodes } from 'http-status-codes';
import { createJWT, fillRDO } from '../../core/utils/common.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import NewUserRDO from './rdo/new-user.rdo.js';
import RentOfferService from '../rent-offer/rent-offer.service.js';
import RentOfferBasicRDO from '../rent-offer/rdo/rent-offer-basic.rdo.js';
import CreateUserDTO from './dto/create-user.dto.js';
import HttpError from '../../core/errors/http-error.js';
import { ValidateObjectIdMiddleware } from '../../core/middlewares/validate-id.middleware.js';
import { ValidateDTOMiddleware } from '../../core/middlewares/validate-dto.middleware.js';
import AuthUserDTO from './dto/auth-user.dto.js';
import { DocumentExistsMiddleware } from '../../core/middlewares/document-exists.middleware.js';
import { UploadFileMiddleware } from '../../core/middlewares/upload-file.middleware.js';
import { ReqBody, ResBody } from '../../types/request.type.js';
import { JWT_ALGORITHM } from './user.constants.js';
import AuthUserRDO from './rdo/auth-user.rdo.js';

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
    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.register,
      middlewares: [new ValidateDTOMiddleware(CreateUserDTO)]
    });
    this.addRoute({path: '/auth', method: HttpMethod.Get, handler: this.checkAuth});
    this.addRoute({
      path: '/auth',
      method: HttpMethod.Post,
      handler: this.requestAuth,
      middlewares: [new ValidateDTOMiddleware(AuthUserDTO)]
    });
    this.addRoute({path: '/logout', method: HttpMethod.Delete, handler: this.logout});
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Put,
      handler: this.loadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar')
      ]
    });
    this.addRoute({
      path: '/:userId/favorites/',
      method: HttpMethod.Get,
      handler:this.getFavorites,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId')
      ]
    });
    this.addRoute({
      path: '/:userId/favorites/:offerId',
      method: HttpMethod.Put,
      handler:this.updateFavoriteStatus,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId')
      ]
    });

  }

  public async register({body: registerData}: Request<ReqBody, ResBody, CreateUserDTO>, res: Response): Promise<void> {
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

  public async requestAuth({body: authData}: Request<ReqBody, ResBody, AuthUserDTO>, res: Response): Promise<void> {

    const existUser = await this.userService.verifyUser(authData, this.configService.get('SALT'));

    if (!existUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wrong authentication data. Check your login and password.',
        'UserController'
      );
    }

    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      {
        email: existUser.email,
        id: existUser.id
      }
    );

    this.ok(res, fillRDO(AuthUserRDO, {token}));
  }

  public async loadAvatar(req: Request, res: Response): Promise<void> {
    this.created(res, {
      filepath: req.file?.path
    });
  }

  public async logout(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'not implemented');
  }

  public async updateFavoriteStatus(req: Request, res: Response): Promise<void> {
    if(!Object.keys(req.query).includes('isFav')) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'UserController'
      );
    }
    const {params: {userId, offerId}, query: {isFav}} = req;
    if (!isFav) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Incorrect path Error. Check your request',
        'UserController'
      );
    }
    const status = Number.parseInt(isFav.toString(), 10) === 1;
    const updateUser = await this.userService.changeFavoriteStatus(userId, offerId, status);
    this.send(res, 201, updateUser);
  }

  public async getFavorites(req: Request, res: Response): Promise<void> {
    const {params: {userId}} = req;
    const existedUserFavorites = await this.userService.findUserFavorites(userId);
    const favoritesResponse = existedUserFavorites?.map((offer) => fillRDO(RentOfferBasicRDO, offer));
    this.ok(res, favoritesResponse);
  }
}
