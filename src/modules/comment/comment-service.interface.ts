import { DocumentType } from '@typegoose/typegoose';

import CreateCommentDTO from './dto/create-comment.dto.js';
import { CommentEntity } from './comment.entity.js';

export interface CommentServiceInterface {
  create(dto: CreateCommentDTO): Promise<DocumentType<CommentEntity>>;

  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>;

  deleteByOfferId(offerId: string): Promise<number | null>;
}
