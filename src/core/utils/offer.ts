import type { Goods } from '../../types/goods.type.js';
import type { Location } from '../../types/location.type.js';
import type { OfferType } from '../../types/offer-type.type.js';
import type { RentOffer } from '../../types/rent-offer.type.js';
import type { UserStatus } from '../../types/user-status.type.js';
import type { User } from '../../types/user.type.js';


export function createOffer(offerData: string): RentOffer {
  const [
    title, description, offerDate, cityName,
    cityLatitude, cityLongitude, previewImage,
    images, isPremium, isFavorite,
    rating, type, bedrooms, maxAdults,
    price, goods, username, email,
    avatar, userStatus, longitude, latitude
  ] = offerData.replace('\n', '').split('\t');

  const offerImages = images.split(';');
  const offerGoods = goods.split(';');
  const location: Location = {
    latitude: Number.parseFloat(latitude),
    longitude: Number.parseFloat(longitude),
  };
  const advertiser: User = {
    username,
    email,
    avatarPath: avatar,
    status: userStatus as UserStatus
  };

  return {
    title,
    description,
    offerDate: new Date(offerDate),
    city: {
      name: cityName,
      latitude: Number.parseFloat(cityLatitude),
      longitude: Number.parseFloat(cityLongitude)
    },
    previewImage,
    images: offerImages,
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number.parseFloat(rating),
    type: type as OfferType,
    bedrooms: Number.parseInt(bedrooms, 10),
    maxAdults: Number.parseInt(maxAdults, 10),
    price: Number.parseInt(price, 10),
    goods: offerGoods as Goods[],
    advertiser,
    location
  };
}
