import { GeneratorInterface } from './generator.interface.js';
import { getRandomOfferDate, getRandomNumber, getRandomArrItem, getRandomArrItems } from '../../core/utils/random.js';
import { CityName } from '../../types/city.type.js';
import { OfferType } from '../../types/offer-type.type.js';
import { Goods } from '../../types/goods.type.js';
import { UserStatus } from '../../types/user-status.type.js';
import type { MockData } from '../../types/mock-data.type.js';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const MIN_RATING = 0;
const MAX_RATING = 5;

const MIN_BEDROOMS = 1;
const MAX_BADROOMS = 8;
const MIN_ADULTS = 1;
const MAX_ADULTS = 10;

export default class OfferGenerator implements GeneratorInterface {
  constructor(private readonly mockData: MockData) {}

  public generate(): string {
    const title = getRandomArrItem<string>(this.mockData.titles);
    const description = getRandomArrItem<string>(this.mockData.descriptions);
    const offerDate = getRandomOfferDate().toISOString();

    const city = getRandomArrItem<string>(Object.values(CityName));
    const isPremium = getRandomArrItem<string>(['true', 'false']);
    const rating = getRandomNumber(MIN_RATING, MAX_RATING, 1).toString();
    const type = getRandomArrItem<string>(Object.values(OfferType));
    const bedrooms = getRandomNumber(MIN_BEDROOMS, MAX_BADROOMS).toString();
    const maxAdults = getRandomNumber(MIN_ADULTS, MAX_ADULTS).toString();
    const price = getRandomNumber(MIN_PRICE, MAX_PRICE).toString();
    const goods = getRandomArrItems<string>(Object.values(Goods)).join(';');
    const username = getRandomArrItem<string>(this.mockData.usernames);
    const email = getRandomArrItem<string>(this.mockData.emails);
    const userStatus = getRandomArrItem<string>(Object.values(UserStatus));
    const longitude = getRandomArrItem<string>(this.mockData.longitudes);
    const latitude = getRandomArrItem<string>(this.mockData.latitudes);

    return [
      title, description, offerDate, city,
      isPremium, rating, type, bedrooms,
      maxAdults, price, goods, username,
      email, userStatus, longitude, latitude
    ].join('\t');
  }
}
