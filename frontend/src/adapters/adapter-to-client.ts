import { UserType } from '../const';
import CommentRDO from '../dto/comment/rdo/comment.rdo';
import RentOfferBasicRDO from '../dto/rent-offer/rdo/rent-offer-basic.rdo';
import RentOfferFullRDO from '../dto/rent-offer/rdo/rent-offer-full.rdo';
import UserAuthRDO from '../dto/user/rdo/user-auth.rdo';
import UserBasicRDO from '../dto/user/rdo/user-basic.rdo';
import { UserStatus } from '../dto/user/user.constants';
import { Comment, Offer, User, UserWithToken } from '../types/types';

export {};

export const adaptOffersToClient = (offers: RentOfferBasicRDO[]): Offer[] =>
  offers.map((offer: RentOfferBasicRDO) => ({
    id: offer.id,
    price: offer.price,
    rating: offer.rating,
    title: offer.title,
    isPremium: offer.isPremium,
    isFavorite: offer.isFavorite,
    city: {
      name: offer.city.name,
      location: {
        latitude: offer.city.latitude,
        longitude: offer.city.longitude
      }
    },
    location: {
      latitude: offer.latitude,
      longitude: offer.longitude
    },
    previewImage: offer.previewImage,
    type: offer.type,
    bedrooms: 0,
    description: '',
    goods: [],
    host: {
      name: '',
      avatarUrl: '',
      type: UserType.Regular,
      email: '',
    },
    images: [],
    maxAdults: 0
  }));

export const adaptOfferToClient = (offer: RentOfferFullRDO): Offer => ({
  id: offer.id,
  price: offer.price,
  rating: offer.rating,
  title: offer.title,
  isPremium: offer.isPremium,
  isFavorite: offer.isFavorite,
  city: {
    name: offer.city.name,
    location: {
      latitude: offer.city.latitude,
      longitude: offer.city.longitude
    }
  },
  location: {
    latitude: offer.latitude,
    longitude: offer.longitude
  },
  previewImage: offer.previewImage,
  type: offer.type,
  bedrooms: offer.bedrooms,
  description: offer.description,
  goods: offer.goods,
  host: adaptUserToClient(offer.advertiser),
  images: offer.images,
  maxAdults: offer.maxAdults
});

export const adaptUserToClient = (user: UserBasicRDO): User => ({
  name: user.username,
  avatarUrl: user.avatarPath,
  type: adaptUserStatusToClient(user.status),
  email: user.email
});

export const adaptAuthUserToClient = (user: UserAuthRDO): UserWithToken => ({
  name: user.username,
  avatarUrl: user.avatarPath,
  type: adaptUserStatusToClient(user.status),
  email: user.email,
  token: user.token
});

export const adaptUserStatusToClient = (status: UserStatus): UserType =>
  status === UserStatus.Default ? UserType.Regular : UserType.Pro;


export const adaptCommentsToClient = (comments: CommentRDO[]): Comment[] =>
  comments.map((comment: CommentRDO) => adaptCommentToClient(comment));


export const adaptCommentToClient = (comment: CommentRDO): Comment => ({
  id: comment.id,
  comment: comment.text,
  date: comment.postDate,
  rating: comment.rating,
  user: adaptUserToClient(comment.author)
});

