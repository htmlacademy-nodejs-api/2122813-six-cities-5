import { Expose } from 'class-transformer';

export default class UserAuthRDO {

  @Expose()
  public token!: string;

  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public status!: string;

  @Expose({name: 'avatar'})
  public avatarPath!: string;
}
