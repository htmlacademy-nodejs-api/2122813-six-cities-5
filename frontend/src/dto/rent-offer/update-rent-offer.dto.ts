import { CityNames, Goods, OfferType } from './rent-offer.constants';


export default class UpdateRentOfferDTO {
  public title?: string;

  public description?: string;

  public offerDate?: Date;

  public city?: CityNames;

  public previewImage?: string;

  public images?: string[];

  public isPremium?: boolean;

  public type?: OfferType;

  public bedrooms?: number;

  public maxAdults?: number;

  public price?: number;

  public goods?: Goods[];

  public latitude?: number;

  public longitude?: number;
}
