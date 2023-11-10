import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, IsMimeType, IsOptional, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CityName } from '../../../types/city.type.js';
import { Goods } from '../../../types/goods.type.js';
import { OfferType } from '../../../types/offer-type.type.js';
import { ADULTS_COUNT, BEDROOMS_COUNT, DESCRIPTION_LENGTH, IMAGES_COUNT, MIN_GOODS_COUNT, OFFER_PRICE, TITLE_LENGTH } from '../rent-offer.constants.js';

export default class UpdateRentOfferDTO {
  @IsOptional()
  @MinLength(TITLE_LENGTH.MIN, {message: `Minimum title length must be ${TITLE_LENGTH.MIN} chars`})
  @MaxLength(TITLE_LENGTH.MAX, {message: `Maximum title length must be ${TITLE_LENGTH.MAX} chars`})
  public title?: string;

  @IsOptional()
  @MinLength(DESCRIPTION_LENGTH.MIN, {message: `Minimum description length must be ${DESCRIPTION_LENGTH.MIN} chars`})
  @MaxLength(DESCRIPTION_LENGTH.MAX, {message: `Maximum description length must be ${DESCRIPTION_LENGTH.MAX} chars`})
  public description?: string;

  @IsOptional()
  @IsEnum(CityName, {message: 'city must be only one of the following: "Paris", "Cologne", "Brussels", "Amsterdam", "Hamburg", "Dusseldorf"'})
  public city?: CityName;

  @IsOptional()
  @IsMimeType({message: 'preview must be a valid image file'})
  public previewImage?: string;

  @IsOptional()
  @IsArray({message: '"images" field must be an array'})
  @ArrayMinSize(IMAGES_COUNT, {message: `"images" field must contain ${IMAGES_COUNT} image files`})
  @ArrayMaxSize(IMAGES_COUNT, {message: `"images" field must contain ${IMAGES_COUNT} image files`})
  @IsMimeType({each: true, message: 'must be a valid image file'})
  public images?: string[];

  @IsOptional()
  @IsBoolean({message: '"isPremium" field must be a boolean'})
  public isPremium?: boolean;

  @IsOptional()
  @IsEnum(OfferType, {message: 'offer type must be only one of the following: "apartment", "house", "room", "hotel"'})
  public type?: OfferType;

  @IsOptional()
  @IsInt({message: 'bedrooms count must be an integer value'})
  @Min(BEDROOMS_COUNT.MIN, {message: `bedrooms min count is ${BEDROOMS_COUNT.MIN}`})
  @Max(BEDROOMS_COUNT.MAX, {message: `bedrooms max count is ${BEDROOMS_COUNT.MAX}`})
  public bedrooms?: number;

  @IsOptional()
  @IsInt({message: 'maxAdults count must be an integer value'})
  @Min(ADULTS_COUNT.MIN, {message: `maxAdults min count is ${ADULTS_COUNT.MIN}`})
  @Max(ADULTS_COUNT.MAX, {message: `maxAdults max count is ${ADULTS_COUNT.MAX}`})
  public maxAdults?: number;

  @IsOptional()
  @IsInt({message: 'price must be an integer value'})
  @Min(OFFER_PRICE.MIN, {message: `price min count is ${OFFER_PRICE.MIN}`})
  @Max(OFFER_PRICE.MAX, {message: `price max count is ${OFFER_PRICE.MAX}`})
  public price?: number;

  @IsOptional()
  @IsArray({message: 'field "goods" must be an array'})
  @IsEnum(Goods, {each: true, message: 'each item in "goods" array must be one of the following: "Breakfast", "Air conditioning", "Laptop", "Friendly workspace", "Baby seat", "Washer", "Towels", "Fridge"'})
  @ArrayUnique({message: 'all items in "goods" array must be unique'})
  @ArrayMinSize(MIN_GOODS_COUNT, {message: `field "goods" must contain ${MIN_GOODS_COUNT} items count`})
  public goods?: Goods[];

  @IsOptional()
  @IsLatitude({message: 'latitude must have a correct lat. coordinate format'})
  public latitude?: number;

  @IsOptional()
  @IsLongitude({message: 'longitude must have a correct long. coordinate format'})
  public longitude?: number;
}
