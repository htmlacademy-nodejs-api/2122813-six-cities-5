import { Expose } from 'class-transformer';

export default class AuthUserRDO {
  @Expose()
  public token!: string;
}
