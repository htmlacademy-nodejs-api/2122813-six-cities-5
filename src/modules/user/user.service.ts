import { injectable, inject } from 'inversify';
import type { DocumentType, types } from '@typegoose/typegoose';

import { UserEntity } from './user.entity.js';
import CreateUserDTO from './dto/create-user.dto.js';
import { UserServiceInterface } from './user-service.interface.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';
import { SortType } from '../../types/sort-order.type.js';

@injectable()
export default class UserService implements UserServiceInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {}

  public async create(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);
    const userEntry = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.email}`);
    return userEntry;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({email}).exec();
  }

  public async findById(userId: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(userId).exec();
  }

  public async findOrCreate(DTO: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(DTO.email);
    if (existedUser) {
      return existedUser;
    }

    return this.create(DTO, salt);
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

  public async changeFavoriteStatus(userId: string, offerId: string, status: boolean): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findByIdAndUpdate(userId, {[`${status ? '$addToSet' : '$pull'}`]: { favorites: offerId }}, {new: true}).exec();
  }

  public async exists(userId: string): Promise<boolean> {
    return (await this.userModel.exists({_id: userId})) !== null;
  }
}
