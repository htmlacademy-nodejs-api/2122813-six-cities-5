import { injectable, inject } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDto from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDto from './dto/update-rent-offer.dto.js';
import { SortType } from '../../types/sort-order.type.js';

@injectable()
export default class RentOfferService implements RentOfferServiceInterface {
  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>
  ) {}

  public async create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>> {
    const rentOfferEntry = await this.rentOfferModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);
    return rentOfferEntry.populate(['advertiserId']);
  }

  public async findById(offerId: string, isFavorite: boolean): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findById(offerId)
      .populate(['advertiserId'])
      .transform((doc) => doc === null ? doc : Object.assign(doc, {isFavorite}))
      .exec();
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
            $cond: [{$ne: [{ $type: '$user.favorites'}, 'missing']},
              {$cond: [{$in: ['$_id', '$user.favorites']}, true, false]},
              false]
          }
        }
      },
      { $unset: 'user' },
      { $sort: { createdAt: SortType.Down }},
      { $limit: offersCount}
    ]).exec();
  }

  public async updateById(offerId: string, dto: UpdateRentOfferDto): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findByIdAndUpdate(offerId, dto, {new: true})
      .populate(['advertiserId'])
      .exec();
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
            { $project: {_id: false, favorites: true}}
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isFavorite: {
            $cond: [{$ne: [{ $type: '$user.favorites'}, 'missing']},
              {$cond: [{$in: ['$_id', '$user.favorites']}, true, false]},
              false]
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
}
