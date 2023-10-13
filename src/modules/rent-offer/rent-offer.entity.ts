import typegoose, { Ref, defaultClasses, getModelForClass } from '@typegoose/typegoose';

import { City } from '../../types/city.type.js';
import { OfferType } from '../../types/offer-type.type.js';
import { Goods } from '../../types/goods.type.js';
import { UserEntity } from '../user/user.entity.js';

const {prop, modelOptions} = typegoose;

class Location {
  @prop({required: true})
  public latitude!: number;

  @prop({required: true})
  public longitude!: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface RentOfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'rent-offers'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class RentOfferEntity extends defaultClasses.TimeStamps {

  @prop({required: true, trim: true})
  public title!: string;

  @prop({required: true, trim: true})
  public description!: string;

  @prop({required: true})
  public offerDate!: Date;

  @prop({required: true, type: () => String, enum: City})
  public city!: City;

  @prop({required: true})
  public previewImage!: string;

  @prop({required: true, type: () => [String]})
  public images!: string[];

  @prop({required: true})
  public isPremium!: boolean;

  @prop({required: true})
  public isFavorite!: boolean;

  @prop({required: true})
  public rating!: number;

  @prop({required: true, type: () => String, enum: OfferType })
  public type!: OfferType;

  @prop({required: true})
  public bedrooms!: number;

  @prop({required: true})
  public maxAdults!: number;

  @prop({required: true})
  public price!: number;

  @prop({required: true, type: () => [String], enum: Goods })
  public goods!: Goods[];

  @prop({ ref: UserEntity, required: true })
  public advertiserId!: Ref<UserEntity>;

  @prop({required: true, _id: false})
  public location!: Location;
}

//export const RentOfferModel = getModelForClass(RentOfferEntity);
