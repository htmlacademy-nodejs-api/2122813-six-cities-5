import { DocumentType } from '@typegoose/typegoose';

import CreateUserDTO from './dto/create-user.dto.js';
import { UserEntity } from './user.entity.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';
import { DocumentExistsInterface } from '../../types/document-exists.interface.js';
import AuthUserDTO from './dto/auth-user.dto.js';
import { DocumentModifyInterface } from '../../types/document-modify.interface.js';
import UpdateUserDTO from './dto/update-user.dto.js';

export interface UserServiceInterface extends DocumentExistsInterface, DocumentModifyInterface {
  create(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>>;

  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;

  findById(id: string): Promise<DocumentType<UserEntity> | null>;

  findOrCreate(dto: CreateUserDTO, salt: string): Promise<DocumentType<UserEntity>>;

  findUserFavorites(userId: string): Promise<DocumentType<RentOfferEntity>[] | null>;

  updateById(id: string, dto: UpdateUserDTO): Promise<DocumentType<UserEntity> | null>;

  changeFavoriteStatus(userId: string, offerId: string, status: boolean): Promise<DocumentType<UserEntity> | null>;

  exists(userId: string): Promise<boolean>;

  verifyUser(dto: AuthUserDTO, salt: string): Promise<DocumentType<UserEntity> | null>;

  canModify(authUserId: string, userId: string): Promise<boolean>;

  deleteOfferFromUsersFavorites(offerId: string): Promise<void>;
}
