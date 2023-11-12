import UserBasicRDO from '../../user/rdo/user-basic.rdo';

export default class CommentRDO {
  public id!: string;

  public text!: string;

  public rating!: number;

  public postDate!: string;

  public author!: UserBasicRDO;
}
