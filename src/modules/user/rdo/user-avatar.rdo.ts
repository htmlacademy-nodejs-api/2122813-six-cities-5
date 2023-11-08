import { Expose } from 'class-transformer';

export default class UserAvatarRDO {
  @Expose({name: 'avatar'})
  public avatarPath!: string;
}
