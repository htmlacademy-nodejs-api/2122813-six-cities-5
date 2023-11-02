import {ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, Max, MaxLength, Min, MinLength } from 'class-validator';

import { Goods } from '../../../types/goods.type.js';
import { OfferType } from '../../../types/offer-type.type.js';
import { CityName } from '../../../types/city.type.js';

export default class CreateRentOfferDTO {
  @MinLength(10, {message: 'Minimum title length must be 10 chars'})
  @MaxLength(100, {message: 'Maximum title length must be 100 chars'})
  public title!: string;

  @MinLength(20, {message: 'Minimum description length must be 20 chars'})
  @MaxLength(1024, {message: 'Maximum description length must be 1024 chars'})
  public description!: string;

  @IsEnum(CityName, {message: 'city must be only one of the following: "Paris", "Cologne", "Brussels", "Amsterdam", "Hamburg", "Dusseldorf"'})
  public city!: CityName;

  //@IsMimeType({message: 'preview must be a valid image file'})
  public previewImage!: string;

  //@IsArray({message: '"images" field must be an array'})
  //@ArrayMinSize(6, {message: '"images" field must contain 6 image files'})
  //@ArrayMaxSize(6, {message: '"images" field must contain 6 image files'})
  //@IsMimeType({each: true, message: 'must be a valid image file'})
  public images!: string[];

  @IsBoolean({message: '"isPremium" field must be a boolean'})
  public isPremium!: boolean;

  @IsEnum(OfferType, {message: 'offer type must be only one of the following: "apartment", "house", "room", "hotel"'})
  public type!: OfferType;

  @IsInt({message: 'bedrooms count must be an integer value'})
  @Min(1, {message: 'bedrooms min count is 1'})
  @Max(8, {message: 'bedrooms max count is 8'})
  public bedrooms!: number;

  @IsInt({message: 'maxAdults count must be an integer value'})
  @Min(1, {message: 'maxAdults min count is 1'})
  @Max(10, {message: 'maxAdults max count is 10'})
  public maxAdults!: number;

  @IsInt({message: 'price must be an integer value'})
  @Min(100, {message: 'price min count is 100'})
  @Max(100_000, {message: 'price max count is 100_000'})
  public price!: number;

  @IsArray({message: 'field "goods" must be an array'})
  @IsEnum(Goods, {each: true, message: 'each item in "goods" array must be one of the following: "Breakfast", "Air conditioning", "Laptop", "Friendly workspace", "Baby seat", "Washer", "Towels", "Fridge"'})
  @ArrayUnique({message: 'all items in "goods" array must be unique'})
  @ArrayMinSize(1)
  public goods!: Goods[];

  public advertiserId!: string;

  @IsLatitude({message: 'latitude must have a correct lat. coordinate format'})
  public latitude!: number;

  @IsLongitude({message: 'longitude must have a correct long. coordinate format'})
  public longitude!: number;
}
