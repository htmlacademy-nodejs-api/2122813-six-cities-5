import type { City } from '../../../types/city.type.js';
import type { Goods } from '../../../types/goods.type.js';
import type { Location } from '../../../types/location.type.js';
import type { OfferType } from '../../../types/offer-type.type.js';

export default class UpdateRentOfferDto {
  public title?: string;
  public description?: string;
  public city?: City;
  public previewImage?: string;
  public images?: string[];
  public isPremium?: boolean;
  public isFavorite?: boolean;
  public rating?: number;
  public type?: OfferType;
  public bedrooms?: number;
  public maxAdults?: number;
  public price?: number;
  public goods?: Goods[];
  public location?: Location;
}
