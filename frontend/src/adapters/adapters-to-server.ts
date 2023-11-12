import { UserType } from '../const';
import CreateCommentDTO from '../dto/comment/create-comment.dto';
import CreateRentOfferDTO from '../dto/rent-offer/create-rent-offer.dto';
import { CityNames, Goods, OfferType } from '../dto/rent-offer/rent-offer.constants';
import UpdateRentOfferDTO from '../dto/rent-offer/update-rent-offer.dto';
import CreateUserDTO from '../dto/user/create-user.dto';
import { UserStatus } from '../dto/user/user.constants';
import { CommentAuth, NewOffer, Offer, UserRegister } from '../types/types';

export const adaptRegisterUserToServer =
  (user: UserRegister): CreateUserDTO => ({
    username: user.name,
    email: user.email,
    status: adaptUserTypeToServer(user.type),
    password: user.password,
  });

export const adaptUserTypeToServer = (type: UserType): UserStatus =>
  type === UserType.Regular ? UserStatus.Default : UserStatus.Pro;


export const adaptNewOfferToServer = (offer: NewOffer): CreateRentOfferDTO => ({
  title: offer.title,
  description: offer.description,
  offerDate: undefined,
  city: offer.city.name as CityNames,
  previewImage: offer.previewImage,
  images: offer.images,
  isPremium: offer.isPremium,
  type: offer.type as OfferType,
  bedrooms: offer.bedrooms,
  maxAdults: offer.maxAdults,
  price: offer.price,
  goods: offer.goods as Goods[],
  latitude: offer.location.latitude,
  longitude: offer.location.longitude
});

export const adaptExistOfferToServer = (offer: Offer): UpdateRentOfferDTO => ({
  title: offer.title,
  description: offer.description,
  offerDate: undefined,
  city: offer.city.name as CityNames,
  previewImage: offer.previewImage,
  images: offer.images,
  isPremium: offer.isPremium,
  type: offer.type as OfferType,
  bedrooms: offer.bedrooms,
  maxAdults: offer.maxAdults,
  price: offer.price,
  goods: offer.goods as Goods[],
  latitude: offer.location.latitude,
  longitude: offer.location.longitude
});

export const adaptNewCommentToServer = (commentary: CommentAuth): CreateCommentDTO => ({
  text: commentary.comment,
  rating: commentary.rating,
  offerId: commentary.id
});


