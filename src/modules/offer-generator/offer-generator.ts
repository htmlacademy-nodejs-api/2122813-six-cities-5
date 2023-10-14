import { OfferGeneratorInterface } from './offer-generator.interface.js';
import { getRandomOfferDate, getRandomNumber, getRandomArrItem, getRandomArrItems } from '../../core/utils/random.js';
import { CityName } from '../../types/city.type.js';
import { Cities } from '../rent-offer/rent-offer.constants.js';
import { OfferType } from '../../types/offer-type.type.js';
import { Goods } from '../../types/goods.type.js';
import { UserStatus } from '../../types/user-status.type.js';

import type { MockData } from '../../types/mock-data.type.js';


const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const MIN_RATING = 1;
const MAX_RATING = 5;

const MIN_BEDROOMS = 1;
const MAX_BADROOMS = 8;

const MIN_ADULTS = 1;
const MAX_ADULTS = 10;

const OFFER_IMAGES_COUNT = 6;

export default class OfferGenerator implements OfferGeneratorInterface {
  constructor(private readonly mockData: MockData) {}

  public generate(): string {
    const title = getRandomArrItem<string>(this.mockData.titles);
    const description = getRandomArrItem<string>(this.mockData.descriptions);
    const offerDate = getRandomOfferDate().toISOString();

    const city = getRandomArrItem(Object.values(CityName).filter((x) => typeof x === 'string'));
    const cityName = city;
    const cityLatitude = Cities[city].latitude;
    const cityLongitude = Cities[city].longitude;

    const previewImage = getRandomArrItem<string>(this.mockData.previewImages);
    const images = getRandomArrItems<string>(this.mockData.offerImages, OFFER_IMAGES_COUNT).join(';');
    const isPremium = getRandomArrItem<string>(['true', 'false']);
    const isFavorite = getRandomArrItem<string>(['true', 'false']);
    const rating = getRandomNumber(MIN_RATING, MAX_RATING, 1).toString();
    const type = getRandomArrItem<string>(Object.values(OfferType));
    const bedrooms = getRandomNumber(MIN_BEDROOMS, MAX_BADROOMS).toString();
    const maxAdults = getRandomNumber(MIN_ADULTS, MAX_ADULTS).toString();
    const price = getRandomNumber(MIN_PRICE, MAX_PRICE).toString();
    const goods = getRandomArrItems<string>(Object.values(Goods)).join(';');
    const username = getRandomArrItem<string>(this.mockData.usernames);
    const email = getRandomArrItem<string>(this.mockData.emails);
    const avatar = getRandomArrItem<string>(this.mockData.avatars);
    const userStatus = getRandomArrItem<string>(Object.values(UserStatus));
    const longitude = getRandomArrItem<string>(this.mockData.longitudes);
    const latitude = getRandomArrItem<string>(this.mockData.latitudes);

    return [
      title, description, offerDate, cityName, cityLatitude,
      cityLongitude, previewImage, images, isPremium, isFavorite,
      rating, type, bedrooms, maxAdults, price,
      goods, username, email, avatar, userStatus,
      longitude, latitude
    ].join('\t');
  }
}
