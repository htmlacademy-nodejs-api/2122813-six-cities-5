import typegoose, { defaultClasses, Ref } from '@typegoose/typegoose';

import { RentOfferEntity } from '../rent-offer/rent-offer.entity.js';
import { UserEntity } from '../user/user.entity.js';

const { prop, modelOptions } = typegoose;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface CommentEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'comments'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({trim: true, required: true})
  public text!: string;

  @prop({required: true})
  public rating!: number;

  @prop({
    ref: () => RentOfferEntity,
    required: true
  })
  public offerId!: Ref<RentOfferEntity>;

  @prop({
    ref: () => UserEntity,
    required: true,
  })
  public authorId!: Ref<UserEntity>;
}
