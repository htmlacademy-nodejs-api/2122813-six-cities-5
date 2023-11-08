import { Expose, Type, Transform } from 'class-transformer';

import { City } from './rent-offer-basic.rdo.js';
import { OfferType } from '../../../types/offer-type.type.js';
import { Cities } from '../rent-offer.constants.js';


class Advertiser {
  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public status!: string;

  @Expose({name: 'avatar'})
  public avatarPath!: string;
}

export class RentOfferFullRDO {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

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
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: OfferType;

  @Expose()
  public bedrooms!: number;

  @Expose()
  public maxAdults!: number;

  @Expose()
  public price!: number;

  @Expose()
  public goods!: string[];

  @Expose({name: 'advertiserId'})
  @Type(() => Advertiser)
  public advertiser!: Advertiser;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}
