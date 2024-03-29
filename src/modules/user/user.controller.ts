import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';

import { Controller } from '../../core/controller/controller.abstract.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { UserServiceInterface } from './user-service.interface.js';
import { createJWT, fillRDO } from '../../core/utils/common.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import UserAuthRDO from './rdo/user-auth.rdo.js';
import RentOfferService from '../rent-offer/rent-offer.service.js';
import CreateUserDTO from './dto/create-user.dto.js';
import HttpError from '../../core/errors/http-error.js';
import { ValidateObjectIdMiddleware } from '../../core/middlewares/validate-id.middleware.js';
import { ValidateDTOMiddleware } from '../../core/middlewares/validate-dto.middleware.js';
import AuthUserDTO from './dto/auth-user.dto.js';
import { DocumentExistsMiddleware } from '../../core/middlewares/document-exists.middleware.js';
import { UploadFileMiddleware } from '../../core/middlewares/upload-file.middleware.js';
import { ResBody } from '../../types/default-response.type.js';
import { JWT_ALGORITHM } from './user.constants.js';
import { PrivateRouteMiddleware } from '../../core/middlewares/private-route.middleware.js';
import { DocumentModifyMiddleware } from '../../core/middlewares/document-modify.middleware.js';
import UserBasicRDO from './rdo/user-basic.rdo.js';
import AuthError from '../../core/errors/auth-error.js';
import UserAvatarRDO from './rdo/user-avatar.rdo.js';
import UpdateUserDTO from './dto/update-user.dto.js';
import { RentOfferFullRDO } from '../rent-offer/rdo/rent-offer-full.rdo.js';

type ParamsUserDetails = {
  userId: string;
} | ParamsDictionary;
type ParamsFavoriteOfferDetails = {
  userId: string;
  offerId: string;
} | ParamsDictionary;
@injectable()
export default class UserController extends Controller {
  constructor(
  @inject(AppComponent.LoggerInterface) protected readonly logger: LoggerInterface,
  @inject(AppComponent.UserServiceInterface) private readonly userService: UserServiceInterface,
  @inject(AppComponent.RentOfferServiceInterface) private readonly rentOfferService: RentOfferService,
  @inject(AppComponent.ConfigInterface) protected readonly configService: ConfigInterface<RestSchema>
  ) {
    super(logger, configService);
    this.logger.info('Register routes for User Controller…');
    this.addRoute({
      path: '/favorites/:offerId',
      method: HttpMethod.Put,
      handler:this.updateFavoriteStatus,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'Rent-offer', 'offerId'),
      ]
    });
    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.register,
      middlewares: [new ValidateDTOMiddleware(CreateUserDTO)]
    });
    this.addRoute({
      path: '/auth',
      method: HttpMethod.Get,
      handler: this.checkAuth,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/auth',
      method: HttpMethod.Post,
      handler: this.requestAuth,
      middlewares: [new ValidateDTOMiddleware(AuthUserDTO)]
    });
    this.addRoute({
      path: '/:userId/upload/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new DocumentModifyMiddleware(this.userService, 'User', 'userId'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY_PATH'), 'avatar')
      ]
    });
  }

  public async register({body: registerData}: Request<ParamsDictionary, ResBody, CreateUserDTO>, res: Response): Promise<void> {
    const existUser = await this.userService.findByEmail(registerData.email);

    if (existUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        'User with such email already exists. Please enter another email.',
        'UserController'
      );
    }

    const newUser = await this.userService.create(registerData, this.configService.get('SALT'));
    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      {
        email: newUser.email,
        id: newUser.id
      }
    );
    this.created(res, fillRDO(UserAuthRDO, {...newUser.toObject({virtuals: true}), token}));
  }

  public async checkAuth(_req: Request, res: Response): Promise<void> {
    const {email} = res.locals.user;
    const foundedUser = await this.userService.findByEmail(email);

    if (!foundedUser) {
      throw new AuthError(
        'Wrong authentication data. Check your login and password.',
        'UserController'
      );
    }

    this.ok(res, fillRDO(UserBasicRDO, foundedUser));
  }

  public async requestAuth({body: authData}: Request<ParamsDictionary, ResBody, AuthUserDTO>, res: Response): Promise<void> {
    const existUser = await this.userService.verifyUser(authData, this.configService.get('SALT'));

    if (!existUser) {
      throw new AuthError(
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

    this.ok(res, fillRDO(UserAuthRDO, {...existUser.toObject({virtuals: true}), token}));
  }

  public async uploadAvatar(req: Request<ParamsUserDetails, ResBody, UpdateUserDTO>, res: Response): Promise<void> {
    const {userId} = req.params;

    if (req.file) {
      const uploadFile = {avatar: req.file.filename};
      const updatedUser = await this.userService.updateById(userId, uploadFile);
      this.created(res, fillRDO(UserAvatarRDO, updatedUser));
    }
  }

  public async updateFavoriteStatus({params: {offerId}, query: {isFav}}: Request<ParamsFavoriteOfferDetails>, res: Response): Promise<void> {

    if(!isFav || (isFav !== '0' && isFav !== '1')) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid favorite status. The "isFav" query parameter must be either "0" or "1".',
        'UserController'
      );
    }
    const userId = res.locals.user.id;
    const status = isFav === '1';
    await this.userService.changeFavoriteStatus(userId, offerId, status);
    const offer = await this.rentOfferService.findById(offerId, userId);
    this.ok(res, fillRDO(RentOfferFullRDO, offer));
  }
}
