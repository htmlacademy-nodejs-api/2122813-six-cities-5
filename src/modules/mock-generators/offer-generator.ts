import { GeneratorInterface } from './generator.interface.js';
import { getRandomOfferDate, getRandomNumber, getRandomArrItem, getRandomArrItems } from '../../core/utils/random.js';
import { CityNames } from '../../types/city.type.js';
import { OfferType } from '../../types/offer-type.type.js';
import { Goods } from '../../types/goods.type.js';
import { UserStatus } from '../../types/user-status.type.js';
import type { MockData } from '../../types/mock-data.type.js';
import { ADULTS_COUNT, BEDROOMS_COUNT, IMAGES_COUNT, OFFER_PRICE, OFFER_RATING } from '../rent-offer/rent-offer.constants.js';

export default class OfferGenerator implements GeneratorInterface {
  constructor(private readonly mockData: MockData) {}

  public generate(): string {
    const title = getRandomArrItem<string>(this.mockData.titles);
    const description = getRandomArrItem<string>(this.mockData.descriptions);
    const offerDate = getRandomOfferDate().toISOString();

    const city = getRandomArrItem<string>(Object.values(CityNames));
    const isPremium = getRandomArrItem<string>(['true', 'false']);
    const previewImage = getRandomArrItem<string>(this.mockData.previewImages);
    const images = getRandomArrItems<string>(this.mockData.images, IMAGES_COUNT).join(';');
    const rating = getRandomNumber(OFFER_RATING.MIN, OFFER_RATING.MAX, 1).toString();
    const type = getRandomArrItem<string>(Object.values(OfferType));
    const bedrooms = getRandomNumber(BEDROOMS_COUNT.MIN, BEDROOMS_COUNT.MAX).toString();
    const maxAdults = getRandomNumber(ADULTS_COUNT.MIN, ADULTS_COUNT.MAX).toString();
    const price = getRandomNumber(OFFER_PRICE.MIN, OFFER_PRICE.MAX).toString();
    const goods = getRandomArrItems<string>(Object.values(Goods)).join(';');
    const username = getRandomArrItem<string>(this.mockData.usernames);
    const email = getRandomArrItem<string>(this.mockData.emails);
    const userStatus = getRandomArrItem<string>(Object.values(UserStatus));

    return [
      title, description, offerDate, city,
      isPremium, previewImage, images, rating, type,
      bedrooms, maxAdults, price, goods,
      username, email, userStatus
    ].join('\t');
  }
}
