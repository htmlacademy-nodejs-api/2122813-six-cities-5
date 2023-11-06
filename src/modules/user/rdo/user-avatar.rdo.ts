import { Expose } from 'class-transformer';

export default class UserAvatarRDO {
  @Expose()
  public avatarPath!: string;
}
