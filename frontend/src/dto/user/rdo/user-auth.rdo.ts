import { UserStatus } from '../user.constants';

export default class UserAuthRDO {

  public id!: string;

  public token!: string;

  public username!: string;

  public email!: string;

  public status!: UserStatus;

  public avatarPath!: string;
}
