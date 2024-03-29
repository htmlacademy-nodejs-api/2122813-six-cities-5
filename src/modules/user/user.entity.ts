import typegoose, { defaultClasses, Ref } from '@typegoose/typegoose';

import type { User } from '../../types/user.type.js';
import { UserStatus } from '../../types/user-status.type.js';
import { createSHA256 } from '../../core/utils/common.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';
import { DEFAULT_AVATAR_FILE_NAME } from './user.constants.js';

const {prop, modelOptions} = typegoose;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}
@modelOptions({
  schemaOptions: {
    collection: 'users'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps {

  @prop({required: true})
  public username!: string;

  @prop({required: true, unique: true})
  public email!: string;

  @prop({required: true, default: DEFAULT_AVATAR_FILE_NAME})
  public avatar!: string;

  @prop({required: true, type: () => String, enum: UserStatus})
  public status!: UserStatus;

  @prop({required: true, ref: () => RentOfferEntity, _id: false, default: [], type: () => [RentOfferEntity]})
  public favorites!: Ref<RentOfferEntity>[];

  @prop({required: true})
  private password?: string;

  constructor(userData: User) {
    super();

    this.username = userData.username;
    this.email = userData.email;
    this.status = userData.status;
  }

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword() {
    return this.password;
  }

  public verifyPassword(password: string, salt: string) {
    const hashPassword = createSHA256(password, salt);
    return hashPassword === this.password;
  }
}
