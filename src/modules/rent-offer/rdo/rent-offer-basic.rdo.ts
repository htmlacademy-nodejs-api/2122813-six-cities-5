import { Expose, Type, Transform } from 'class-transformer';

import { OfferType } from '../../../types/offer-type.type.js';
import { Cities } from '../rent-offer.constants.js';

export class City {
  @Expose()
  public name!: string;

  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

export default class RentOfferBasicRDO {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose({name: 'createdAt'})
  @Type(() => Date)
  public offerDate!: Date;

  @Expose()
  @Type(() => City)
  @Transform(({ value }) => Cities[value])
  public city!: City;

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: OfferType;

  @Expose()
  public price!: number;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}
