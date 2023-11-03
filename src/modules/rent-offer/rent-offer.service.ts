import { injectable, inject } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDTO from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDTO from './dto/update-rent-offer.dto.js';
import { SortType } from '../../types/sort-order.type.js';

@injectable()
export default class RentOfferService implements RentOfferServiceInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>
  ) {}

  public async create(dto: CreateRentOfferDTO): Promise<DocumentType<RentOfferEntity>> {
    const rentOfferEntry = await this.rentOfferModel.create(dto).then((offer) => {
      offer.isFavorite = false;
      return offer;
    });
    this.logger.info(`New offer created: ${dto.title}`);
    return rentOfferEntry.populate(['advertiserId']);
  }

  public async findById(offerId: string, userId?: string): Promise<DocumentType<RentOfferEntity> | null> {

    let result = await this.rentOfferModel.aggregate([
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
          }
        }
      },
      { $unset: 'user' },
    ]).exec();
    result = await this.rentOfferModel.populate(result, {path: 'advertiserId'});
    return result[0];
  }

  public async find(offersCount: number, userId?: string): Promise<DocumentType<RentOfferEntity>[]> {
    return this.rentOfferModel.aggregate([
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
          }
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
    return this.rentOfferModel.aggregate([
      { $match:
        {$and:
          [
            { $expr: {$eq: ['$city.name', city] } },
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
          }
        }
      },
      { $unset: 'user' },
      { $sort: { createdAt: SortType.Down }},
      { $limit: offersCount}
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
}
