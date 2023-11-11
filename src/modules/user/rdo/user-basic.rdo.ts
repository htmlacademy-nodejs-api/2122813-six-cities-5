import { Expose } from 'class-transformer';

export default class UserBasicRDO {
  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public status!: string;

  @Expose({name: 'avatar'})
  public avatarPath!: string;
}
