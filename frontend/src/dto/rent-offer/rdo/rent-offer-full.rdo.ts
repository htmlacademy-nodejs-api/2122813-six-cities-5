import { City, OfferType } from '../rent-offer.constants.js';
import UserBasicRDO from '../../user/rdo/user-basic.rdo.js';


export default class RentOfferFullRDO {
  public id!: string;

  public title!: string;

  public description!: string;

  public offerDate!: string;

  public city!: City;

  public previewImage!: string;

  public images!: string[];

  public isPremium!: boolean;

  public isFavorite!: boolean;

  public rating!: number;

  public type!: OfferType;

  public bedrooms!: number;

  public maxAdults!: number;

  public price!: number;

  public goods!: string[];

  public advertiser!: UserBasicRDO;

  public commentsCount!: number;

  public latitude!: number;

  public longitude!: number;
}


