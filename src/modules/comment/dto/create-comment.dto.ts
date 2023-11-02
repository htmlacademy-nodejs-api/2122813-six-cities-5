import { IsInt, IsMongoId, Max, MaxLength, Min, MinLength } from 'class-validator';

export default class CreateCommentDTO {

  @MinLength(5, {message: 'Minimum comment length must be 5 chars'})
  @MaxLength(1024, {message: 'Maximum comment length must be 1024 chars'})
  public text!: string;

  @IsInt({message: 'rating must be an integer'})
  @Min(1, {message: 'rating min value is 1'})
  @Max(5, {message: 'rating max value is 5'})
  public rating!: number;

  @IsMongoId({message: 'offerId field must be a valid id'})
  public offerId!: string;

  public authorId!: string;
}
