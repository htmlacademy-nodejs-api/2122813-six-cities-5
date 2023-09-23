import type { City } from './city.type.js';
import type { Goods } from './goods.type.js';
import type { Location } from './location.type.js';
import type { OfferType } from './offer-type.type.js';
import type { User } from './user.type.js';

export type RentOffer = {
  title: string,
  description: string,
  offerDate: string,
  city: City
  previewImage: string,
  images: string[],
  isPremium: boolean,
  isFavorite: boolean,
  rating: number,
  type: OfferType,
  bedrooms: number,
  maxAdults: number,
  price: number,
  goods: Goods[],
  advertiser: User
  location: Location,
}
