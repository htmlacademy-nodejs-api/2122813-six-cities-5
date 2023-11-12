import {Expose, Type} from 'class-transformer';

class Author {
  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public status!: string;

  @Expose({name: 'avatar'})
  public avatarPath!: string;
}

export default class CommentRDO {
  @Expose()
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  @Expose({ name: 'createdAt'})
  public postDate!: string;

  @Expose({ name: 'authorId'})
  @Type(() => Author)
  public author!: Author;
}
