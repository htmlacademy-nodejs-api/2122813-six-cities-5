import { injectable, inject } from 'inversify';
import type { DocumentType, types } from '@typegoose/typegoose';

import { UserEntity } from './user.entity.js';
import CreateUserDTO from './dto/create-user.dto.js';
import {UserServiceInterface} from './user-service.interface.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';
import { SortType } from '../../types/sort-order.type.js';
import AuthUserDTO from './dto/auth-user.dto.js';
import UpdateUserDTO from './dto/update-user.dto.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { getFullServerPath } from '../../core/utils/common.js';
import { DEFAULT_STATIC_IMAGES } from '../../app/rest.constants.js';

@injectable()
export default class UserService implements UserServiceInterface {

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(AppComponent.ConfigInterface) protected readonly configService: ConfigInterface<RestSchema>
  ) {}

  public async create(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>> {

    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const userEntry = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.email}`);
    Object.assign(userEntry, {avatar: this.buildUserAvatarPath(userEntry)});

    return userEntry;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    const existUser = await this.userModel.findOne({email}).exec();

    if(existUser) {
      Object.assign(existUser, {avatar: this.buildUserAvatarPath(existUser)});
    }
    return existUser;
  }

  public async findById(userId: string): Promise<DocumentType<UserEntity> | null> {
    const existUser = await this.userModel.findById(userId).exec();

    if(existUser) {
      Object.assign(existUser, {avatar: this.buildUserAvatarPath(existUser)});
    }

    return existUser;
  }

  public async findOrCreate(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);
    if (existedUser) {
      return existedUser;
    }
    return this.create(dto, salt);
  }

  public async findUserFavorites(userId: string): Promise<DocumentType<RentOfferEntity>[] | null> {
    return this.userModel
      .findById(userId, {favorites: true, _id: false})
      .populate<{favorites: DocumentType<RentOfferEntity>[]}>(
        {
          path: 'favorites',
          options: {sort: {createdAt: SortType.Down}},
        })
      .orFail()
      .exec()
      .then((res) => res.favorites);
  }

  public async updateById(userId: string, dto: UpdateUserDTO): Promise<DocumentType<UserEntity> | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, dto, {new: true});
    if(updatedUser) {
      Object.assign(updatedUser, {avatar: this.buildUserAvatarPath(updatedUser)});
    }

    return updatedUser;

  }

  public async changeFavoriteStatus(userId: string, offerId: string, status: boolean): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findByIdAndUpdate(userId, {[`${status ? '$addToSet' : '$pull'}`]: { favorites: offerId }}, {new: true}).exec();
  }

  public async exists(userId: string): Promise<boolean> {
    return (await this.userModel.exists({_id: userId})) !== null;
  }

  public async verifyUser(dto: AuthUserDTO, salt: string): Promise<DocumentType<UserEntity> | null> {
    const existUser = await this.findByEmail(dto.email);
    if (!existUser || !existUser.verifyPassword(dto.password, salt)) {
      return null;
    }
    return existUser;
  }

  public async canModify(authUserId: string, userId: string): Promise<boolean> {
    return authUserId === userId;
  }

  private get uploadDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('UPLOAD_DIRECTORY_PATH')}`;
  }

  private get staticDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('STATIC_DIRECTORY_PATH')}`;
  }

  private buildUserAvatarPath(user: UserEntity) {
    if (DEFAULT_STATIC_IMAGES.includes(user.avatar)) {
      return `${this.staticDirPath}/${user.avatar}`;
    }
    return `${this.uploadDirPath}/${user.id}/avatar/${user.avatar}`;
  }
}
