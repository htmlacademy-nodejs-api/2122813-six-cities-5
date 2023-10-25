import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsInt, IsLatitude, IsLongitude, IsMimeType, IsOptional, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CityName } from '../../../types/city.type.js';
import { Goods } from '../../../types/goods.type.js';
import { OfferType } from '../../../types/offer-type.type.js';

export default class UpdateRentOfferDTO {
  @IsOptional()
  @MinLength(10, {message: 'Minimum title length must be 10 chars'})
  @MaxLength(100, {message: 'Maximum title length must be 100 chars'})
  public title?: string;

  @IsOptional()
  @MinLength(20, {message: 'Minimum description length must be 20 chars'})
  @MaxLength(1024, {message: 'Maximum description length must be 1024 chars'})
  public description?: string;

  @IsOptional()
  @IsEnum(CityName, {message: 'city must be only one of the following: "Paris", "Cologne", "Brussels", "Amsterdam", "Hamburg", "Dusseldorf"'})
  public city?: CityName;

  @IsOptional()
  @IsMimeType({message: 'preview must be a valid image file'})
  public previewImage?: string;

  @IsOptional()
  @IsArray({message: '"images" field must be an array'})
  @ArrayMinSize(6, {message: '"images" field must contain 6 image files'})
  @ArrayMaxSize(6, {message: '"images" field must contain 6 image files'})
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
  @Min(1, {message: 'bedrooms min count is 1'})
  @Max(8, {message: 'bedrooms max count is 8'})
  public bedrooms?: number;

  @IsOptional()
  @IsInt({message: 'maxAdults count must be an integer value'})
  @Min(1, {message: 'maxAdults min count is 1'})
  @Max(10, {message: 'maxAdults max count is 10'})
  public maxAdults?: number;

  @IsOptional()
  @IsInt({message: 'price must be an integer value'})
  @Min(100, {message: 'price min count is 100'})
  @Max(100_000, {message: 'price max count is 100_000'})
  public price?: number;

  @IsOptional()
  @IsArray({message: 'field "goods" must be an array'})
  @IsEnum(Goods, {each: true, message: 'each item in "goods" array must be one of the following: "Breakfast", "Air conditioning", "Laptop", "Friendly workspace", "Baby seat", "Washer", "Towels", "Fridge"'})
  @ArrayUnique({message: 'all items in "goods" array must be unique'})
  @ArrayMinSize(1)
  public goods?: Goods[];

  @IsOptional()
  @IsLatitude({message: 'latitude must have a correct lat. coordinate format'})
  public latitude?: number;

  @IsOptional()
  @IsLongitude({message: 'longitude must have a correct long. coordinate format'})
  public longitude?: number;
}
