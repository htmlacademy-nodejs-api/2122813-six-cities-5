import { UserStatus } from './user.constants';

export default class CreateUserDTO {
  public username!: string;

  public email!: string;

  public password!: string;

  public status!: UserStatus;
}
