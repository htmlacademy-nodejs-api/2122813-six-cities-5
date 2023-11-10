import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { PASSWORD_LENGTH } from '../user.constants.js';

export default class AuthUserDTO {
  @IsEmail({}, {message: 'email must be valid'})
  public email!: string;

  @IsString({message: 'password is required'})
  @MinLength(PASSWORD_LENGTH.MIN, {message: `Min length for password is ${PASSWORD_LENGTH.MIN} chars`})
  @MaxLength(PASSWORD_LENGTH.MAX, {message: `Max length for password is ${PASSWORD_LENGTH.MAX} chars`})
  public password!: string;
}
