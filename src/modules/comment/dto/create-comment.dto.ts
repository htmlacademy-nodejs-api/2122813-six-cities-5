import { IsInt, IsMongoId, Max, MaxLength, Min, MinLength } from 'class-validator';

import { COMMENT_LENGTH, COMMENT_RATING } from '../comment.constants.js';

export default class CreateCommentDTO {

  @MinLength(COMMENT_LENGTH.MIN, {message: `Minimum comment length must be ${COMMENT_LENGTH.MIN} chars`})
  @MaxLength(COMMENT_LENGTH.MAX, {message: `Minimum comment length must be ${COMMENT_LENGTH.MAX} chars`})
  public text!: string;

  @IsInt({message: 'rating must be an integer'})
  @Min(COMMENT_RATING.MIN, {message: `rating min value is ${COMMENT_RATING.MIN}`})
  @Max(COMMENT_RATING.MAX, {message: `rating min value is ${COMMENT_RATING.MAX}`})
  public rating!: number;

  @IsMongoId({message: 'offerId field must be a valid id'})
  public offerId!: string;

  public authorId!: string;
}
