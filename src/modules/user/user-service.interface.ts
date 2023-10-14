import { DocumentType } from '@typegoose/typegoose';

import CreateUserDto from './dto/create-user.dto.js';
import UpdateUserDto from './dto/update-user.dto.js';
import { UserEntity } from './user.entity.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';

export interface UserServiceInterface {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findById(id: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  updateById(userId: string, dto: UpdateUserDto): Promise<DocumentType<UserEntity> | null>;
  findUserFavorites(userId: string): Promise<DocumentType<RentOfferEntity>[] | null> ;
  changeFavoriteStatus(userId: string, offerId: string, status: boolean): Promise<DocumentType<UserEntity> | null>
}
