import { getModelForClass } from '@typegoose/typegoose';

import { UserEntity } from '../../modules/user/user.entity.js';
import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';

export const UserModel = getModelForClass(UserEntity);
export const RentOfferModel = getModelForClass(RentOfferEntity);
