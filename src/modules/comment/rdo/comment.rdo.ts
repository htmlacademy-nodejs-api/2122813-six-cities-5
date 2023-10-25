import {Expose, Type} from 'class-transformer';

class Author {
  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public status!: string;

  @Expose()
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
  @Type(() => Date)
  public postDate!: Date;

  @Expose({ name: 'authorId'})
  @Type(() => Author)
  public author!: Author;
}
