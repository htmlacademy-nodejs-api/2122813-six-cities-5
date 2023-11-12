import { UserStatus } from '../user.constants';

export default class UserBasicRDO {
  public username!: string;

  public email!: string;

  public status!: UserStatus;

  public avatarPath!: string;
}
