import { CityName } from './city.type.js';
import { Goods } from './goods.type.js';
import { OfferType } from './offer-type.type.js';
import type { User } from './user.type.js';

export type RentOffer = {
  title: string,
  description: string,
  offerDate: Date,
  city: CityName,
  previewImage?: string,
  images?: string[],
  isPremium: boolean,
  isFavorite?: boolean,
  rating: number,
  type: OfferType,
  bedrooms: number,
  maxAdults: number,
  price: number,
  goods: Goods[],
  advertiser: User
  latitude: number,
  longitude: number
}
