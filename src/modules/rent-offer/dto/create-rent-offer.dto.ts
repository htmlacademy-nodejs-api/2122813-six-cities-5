import {ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, Max, MaxLength, Min, MinLength } from 'class-validator';

import { Goods } from '../../../types/goods.type.js';
import { OfferType } from '../../../types/offer-type.type.js';
import { CityName } from '../../../types/city.type.js';
import { ADULTS_COUNT, BEDROOMS_COUNT, DESCRIPTION_LENGTH, MIN_GOODS_COUNT, OFFER_PRICE, TITLE_LENGTH } from '../rent-offer.constants.js';

export default class CreateRentOfferDTO {
  @MinLength(TITLE_LENGTH.MIN, {message: `Minimum title length must be ${TITLE_LENGTH.MIN} chars`})
  @MaxLength(TITLE_LENGTH.MAX, {message: `Maximum title length must be ${TITLE_LENGTH.MAX} chars`})
  public title!: string;

  @MinLength(DESCRIPTION_LENGTH.MIN, {message: `Minimum description length must be ${DESCRIPTION_LENGTH.MIN} chars`})
  @MaxLength(DESCRIPTION_LENGTH.MAX, {message: `Maximum description length must be ${DESCRIPTION_LENGTH.MAX} chars`})
  public description!: string;

  @IsEnum(CityName, {message: 'city must be only one of the following: "Paris", "Cologne", "Brussels", "Amsterdam", "Hamburg", "Dusseldorf"'})
  public city!: CityName;

  @IsBoolean({message: '"isPremium" field must be a boolean'})
  public isPremium!: boolean;

  @IsEnum(OfferType, {message: 'offer type must be only one of the following: "apartment", "house", "room", "hotel"'})
  public type!: OfferType;

  @IsInt({message: 'bedrooms count must be an integer value'})
  @Min(BEDROOMS_COUNT.MIN, {message: `bedrooms min count is ${BEDROOMS_COUNT.MIN}`})
  @Max(BEDROOMS_COUNT.MAX, {message: `bedrooms max count is ${BEDROOMS_COUNT.MAX}`})
  public bedrooms!: number;

  @IsInt({message: 'maxAdults count must be an integer value'})
  @Min(ADULTS_COUNT.MIN, {message: `maxAdults min count is ${ADULTS_COUNT.MIN}`})
  @Max(ADULTS_COUNT.MAX, {message: `maxAdults max count is ${ADULTS_COUNT.MAX}`})
  public maxAdults!: number;

  @IsInt({message: 'price must be an integer value'})
  @Min(OFFER_PRICE.MIN, {message: `price min count is ${OFFER_PRICE.MIN}`})
  @Max(OFFER_PRICE.MAX, {message: `price max count is ${OFFER_PRICE.MAX}`})
  public price!: number;

  @IsArray({message: 'field "goods" must be an array'})
  @IsEnum(Goods, {each: true, message: 'each item in "goods" array must be one of the following: "Breakfast", "Air conditioning", "Laptop", "Friendly workspace", "Baby seat", "Washer", "Towels", "Fridge"'})
  @ArrayUnique({message: 'all items in "goods" array must be unique'})
  @ArrayMinSize(MIN_GOODS_COUNT, {message: `field "goods" must contain ${MIN_GOODS_COUNT} items count`})
  public goods!: Goods[];

  public advertiserId!: string;

  @IsLatitude({message: 'latitude must have a correct lat. coordinate format'})
  public latitude!: number;

  @IsLongitude({message: 'longitude must have a correct long. coordinate format'})
  public longitude!: number;
}
