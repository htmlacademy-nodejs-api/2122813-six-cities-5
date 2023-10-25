import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export default class AuthUserDTO {
  @IsEmail({}, {message: 'email must be valid'})
  public email!: string;

  @IsString({message: 'password is required'})
  @MinLength(6, {message: 'Min length for password is 6 chars'})
  @MaxLength(12, {message: 'Max length for password is 12 chars'})
  public password!: string;
}
