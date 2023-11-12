import typegoose, { Ref, defaultClasses } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { CityNames } from '../../types/city.type.js';
import { OfferType } from '../../types/offer-type.type.js';
import { Goods } from '../../types/goods.type.js';
import { DEFAULT_PREVIEW_IMAGE } from './rent-offer.constants.js';

const {prop, modelOptions} = typegoose;

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

  @prop({default: new Date()})
  public offerDate?: Date;

  @prop({required: true, type: () => String, enum: CityNames})
  public city!: CityNames;

  @prop({required: true, default: DEFAULT_PREVIEW_IMAGE})
  public previewImage!: string;

  @prop({required: true, type: () => [String]})
  public images!: string[];

  public isFavorite!: boolean;

  @prop({required: true})
  public isPremium!: boolean;

  @prop({default: 0})
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

  @prop({ref: () => UserEntity, required: true })
  public advertiserId!: Ref<UserEntity>;

  @prop({default: 0})
  public commentsCount!: number;

  @prop({required: true})
  public latitude!: number;

  @prop({required: true})
  public longitude!: number;
}
