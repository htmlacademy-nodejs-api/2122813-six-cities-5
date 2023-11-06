import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

import { UserStatus } from '../../../types/user-status.type.js';

export default class CreateUserDTO {
  @IsString({message: 'username is required'})
  @MinLength(1, {message: 'Min length for username is 1 char'})
  @MaxLength(15, {message: 'Max length for username is 15 chars'})
  public username!: string;

  @IsEmail({}, {message: 'email must be valid'})
  public email!: string;

  @IsString({message: 'password is required'})
  @MinLength(6, {message: 'Min length for password is 6 chars'})
  @MaxLength(12, {message: 'Max length for password is 12 chars'})
  public password!: string;

  //@IsOptional()
  //@IsMimeType({message: 'avatar must be a valid image file'})
  //public avatarPath!: string;

  @IsEnum(UserStatus, {message: 'user status must be either "pro" or "обычный"'})
  public status!: UserStatus;
}
