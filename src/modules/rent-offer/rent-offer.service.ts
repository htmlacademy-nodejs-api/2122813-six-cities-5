import { injectable, inject } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDTO from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDTO from './dto/update-rent-offer.dto.js';
import { SortType } from '../../types/sort-order.type.js';
import { getFullServerPath } from '../../core/utils/common.js';
import { ConfigInterface } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { UserEntity } from '../user/user.entity.js';
import { DEFAULT_STATIC_IMAGES } from '../../app/rest.constants.js';

@injectable()
export default class RentOfferService implements RentOfferServiceInterface {

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>,
    @inject(AppComponent.ConfigInterface) protected readonly configService: ConfigInterface<RestSchema>
  ) {}

  public async create(dto: CreateRentOfferDTO): Promise<DocumentType<RentOfferEntity>> {
    let rentOffer = await this.rentOfferModel.create(dto).then((offer) => {
      offer.isFavorite = false;
      return offer;
    });

    rentOffer = await rentOffer.populate(['advertiserId']);

    Object.assign(rentOffer.advertiserId, {avatar: this.buildAvatarPath(rentOffer.advertiserId as UserEntity)});

    this.logger.info(`New offer created: ${dto.title}`);

    return rentOffer;
  }

  public async findById(offerId: string, userId?: string): Promise<DocumentType<RentOfferEntity> | null> {

    let result = await this.rentOfferModel.aggregate<DocumentType<RentOfferEntity>>([
      { $match: { $expr: { $eq: [offerId, { $toString: '$_id'}] } } },
      {
        $lookup: {
          from: 'users',
          pipeline: [
            { $match: { $expr: { $eq: [userId, { $toString: '$_id'}] } } },
            { $project: {_id: false, favorites: true}}
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isFavorite: {
            $cond:
              [
                {$and:
                  [
                    {$ne: [{ $type: '$user.favorites'}, 'missing']},
                    {$in: ['$_id', '$user.favorites']}
                  ]
                },
                true,
                false
              ]
          },
          id: { $toString: '$_id'}
        }
      },
      { $unset: 'user' },
    ]).exec();

    result = await this.rentOfferModel.populate(result, {path: 'advertiserId'});
    const rentOffer = result[0];

    Object.assign(rentOffer.advertiserId, {avatar: this.buildAvatarPath(rentOffer.advertiserId as UserEntity)});

    return rentOffer;
  }

  public async find(offersCount: number, userId?: string): Promise<DocumentType<RentOfferEntity>[]> {

    return this.rentOfferModel.aggregate<DocumentType<RentOfferEntity>>([
      {
        $lookup: {
          from: 'users',
          pipeline: [
            { $match: { $expr: {$eq: [userId, { $toString: '$_id'}] } } },
            { $project: {_id: false, favorites: true}}
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isFavorite: {
            $cond:
              [
                {$and:
                  [
                    {$ne: [{ $type: '$user.favorites'}, 'missing']},
                    {$in: ['$_id', '$user.favorites']}
                  ]
                },
                true,
                false
              ]
          },
          id: { $toString: '$_id'}
        }
      },
      { $unset: 'user' },
      { $sort: { createdAt: SortType.Down }},
      { $limit: offersCount}
    ]).exec();
  }

  public async canModify(userId: string, offerId: string): Promise<boolean> {
    const offer = await this.rentOfferModel.findById(offerId).populate('advertiserId');
    return offer?.advertiserId.id === userId;
  }

  public async updateById(offerId: string, dto: UpdateRentOfferDTO): Promise<DocumentType<RentOfferEntity> | null> {
    await this.rentOfferModel.findByIdAndUpdate(offerId, dto);
    return this.findById(offerId);
  }

  public async deleteById(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findByIdAndDelete(offerId)
      .exec();
  }

  public async findPremium(city: string, offersCount: number, userId?: string): Promise<DocumentType<RentOfferEntity>[]> {

    return this.rentOfferModel.aggregate<DocumentType<RentOfferEntity>>([
      { $match:
        {$and:
          [
            { $expr: {$eq: ['$city', city] } },
            { $expr: {$eq: ['$isPremium', true] } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          pipeline: [
            { $match: { $expr: {$eq: [userId, { $toString: '$_id'}] } } },
            { $project: {_id: false, favorites: true}},
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isFavorite: {
            $cond:
              [
                {$and:
                  [
                    {$ne: [{ $type: '$user.favorites'}, 'missing']},
                    {$in: ['$_id', '$user.favorites']}
                  ]
                },
                true,
                false
              ]
          },
          id: { $toString: '$_id'}
        }
      },
      { $unset: 'user' },
      { $sort: { createdAt: SortType.Down }},
      { $limit: offersCount}
    ]).exec();
  }

  public async findUserFavorites(userId: string): Promise<DocumentType<RentOfferEntity>[] | null> {

    return this.rentOfferModel.aggregate<DocumentType<RentOfferEntity>>([
      {
        $lookup: {
          from: 'users',
          pipeline: [
            { $match: { $expr: {$eq: [userId, { $toString: '$_id'}] } } },
            { $project: {_id: false, favorites: true}},
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: { $expr: {$in: ['$_id', '$user.favorites'] } } },
      { $addFields: { isFavorite: true, id: { $toString: '$_id'} } },
      { $unset: 'user' },
      { $sort: { createdAt: SortType.Down }},
    ]).exec();
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findByIdAndUpdate(offerId, {'$inc': { commentsCount: 1 }})
      .exec();
  }

  public async updateRating(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    const result = await this.rentOfferModel.aggregate([
      { $match: { $expr: { $eq: [offerId, { $toString: '$_id'}] } } },
      {
        $lookup: {
          from: 'comments',
          let: { commentsCount: '$commentsCount'},
          pipeline: [
            { $match: { $expr: { $eq: [offerId, { $toString: '$offerId'}] } } },
            { $group: {_id: null, rating: {$sum: '$rating'} } },
            { $project: {_id: false, rating: {$divide: ['$rating', '$$commentsCount']}}}
          ],
          as: 'commentsRatings'
        }
      },
      { $unwind: { path: '$commentsRatings' } },
      { $project: {_id: false, commentsRatings: true}}
    ]).exec().then((res) => res[0].commentsRatings.rating);
    const newRating = result.toFixed(1);
    return this.rentOfferModel.findByIdAndUpdate(offerId, {'$set': { rating: newRating}});
  }

  public async exists(offerId: string): Promise<boolean> {
    return (await this.rentOfferModel.exists({_id: offerId})) !== null;
  }

  private get uploadDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('UPLOAD_DIRECTORY_PATH')}`;
  }

  private get staticDirPath() {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    return `${fullServerPath}/${this.configService.get('STATIC_DIRECTORY_PATH')}`;
  }

  private buildAvatarPath(advertiser: UserEntity) {
    if (DEFAULT_STATIC_IMAGES.includes(advertiser.avatar)) {
      return `${this.staticDirPath}/${advertiser.avatar}`;
    }

    return `${this.uploadDirPath}/${advertiser.id}/avatar/${advertiser.avatar}`;
  }
}
