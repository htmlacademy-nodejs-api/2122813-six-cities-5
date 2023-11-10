import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

import { UserStatus } from '../../../types/user-status.type.js';
import { PASSWORD_LENGTH, NAME_LENGTH } from '../user.constants.js';

export default class CreateUserDTO {
  @IsString({message: 'username is required'})
  @MinLength(NAME_LENGTH.MIN, {message: `Min length for username is ${NAME_LENGTH.MIN} char`})
  @MaxLength(NAME_LENGTH.MAX, {message: `Max length for username is ${NAME_LENGTH.MAX} chars`})
  public username!: string;

  @IsEmail({}, {message: 'email must be valid'})
  public email!: string;

  @IsString({message: 'password is required'})
  @MinLength(PASSWORD_LENGTH.MIN, {message: `Min length for password is ${PASSWORD_LENGTH.MIN} chars`})
  @MaxLength(PASSWORD_LENGTH.MAX, {message: `Max length for password is ${PASSWORD_LENGTH.MAX} chars`})
  public password!: string;

  @IsEnum(UserStatus, {message: `user status must be either ${UserStatus.Pro} or ${UserStatus.Default}`})
  public status!: UserStatus;
}
