import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';

import { AppComponent } from '../../types/app-component.type.js';
import { CommentServiceInterface } from './comment-service.interface.js';
import { CommentEntity } from './comment.entity.js';
import CommentService from './comment.service.js';
import { CommentModel } from '../entities/index.js';

export function createCommentContainer() {
  const commentContainer = new Container();

  commentContainer.bind<CommentServiceInterface>(AppComponent.CommentServiceInterface)
    .to(CommentService)
    .inSingletonScope();

  commentContainer.bind<types.ModelType<CommentEntity>>(AppComponent.CommentModel)
    .toConstantValue(CommentModel);

  return commentContainer;
}
