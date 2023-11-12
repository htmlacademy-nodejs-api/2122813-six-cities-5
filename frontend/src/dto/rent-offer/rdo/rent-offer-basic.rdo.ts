import { City, OfferType } from '../rent-offer.constants';


export default class RentOfferBasicRDO {
  public id!: string;

  public title!: string;

  public offerDate!: string;

  public city!: City;

  public previewImage!: string;

  public isPremium!: boolean;

  public isFavorite!: boolean;

  public rating!: number;

  public type!: OfferType;

  public price!: number;

  public commentsCount!: number;

  public latitude!: number;

  public longitude!: number;
}
