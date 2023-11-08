import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';

import { CommentServiceInterface } from './comment-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import CreateCommentDTO from './dto/create-comment.dto.js';
import { CommentEntity } from './comment.entity.js';
import { SortType } from '../../types/sort-order.type.js';
import { getFullServerPath } from '../../core/utils/common.js';
import { UserEntity } from '../user/user.entity.js';
import { DEFAULT_STATIC_IMAGES } from '../../app/rest.constants.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { ConfigInterface } from '../../core/config/config.interface.js';

@injectable()
export default class CommentService implements CommentServiceInterface {
  constructor(
    @inject(AppComponent.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(AppComponent.ConfigInterface) protected readonly configService: ConfigInterface<RestSchema>
  ) {}

  public async create(dto: CreateCommentDTO): Promise<DocumentType<CommentEntity>> {
    const newComment = await this.commentModel.create(dto).then((comment) => comment.populate('authorId'));

    Object.assign(newComment.authorId, {avatar: this.buildAvatarPath(newComment.authorId as UserEntity)});
    return newComment;
  }

  public async findByOfferId(offerId: string, commentsCount: number): Promise<DocumentType<CommentEntity>[]> {
    let comments = await this.commentModel
      .find({offerId})
      .limit(commentsCount)
      .sort({createdAt: SortType.Down})
      .populate('authorId')
      .exec();

    comments = comments.map((comment) => comment.toObject({virtuals: true}));
    comments.forEach(({authorId}) => Object.assign(authorId, {avatar: this.buildAvatarPath(authorId as UserEntity)}));

    return comments;
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    return this.commentModel
      .deleteMany({offerId})
      .exec()
      .then((res) => res.deletedCount);
  }

  private get uploadDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('UPLOAD_DIRECTORY_PATH')}`;
  }

  private get staticDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('STATIC_DIRECTORY_PATH')}`;
  }

  private buildAvatarPath(author: UserEntity) {
    if (DEFAULT_STATIC_IMAGES.includes(author.avatar)) {
      return `${this.staticDirPath}/${author.avatar}`;
    }

    return `${this.uploadDirPath}/${author.id}/avatar/${author.avatar}`;
  }
}
