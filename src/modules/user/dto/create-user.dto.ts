import { UserStatus } from '../../../types/user-status.type.js';

export default class CreateUserDTO {
  public username!: string;
  public password!: string;
  public email!: string;
  public avatarPath!: string;
  public status!: UserStatus;
}
