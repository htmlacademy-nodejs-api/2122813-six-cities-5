import { IsMimeType } from 'class-validator';

export default class UpdateUserDTO {
  @IsMimeType({message: 'avatar must be a valid image file'})
  public avatarPath?: string;
}
