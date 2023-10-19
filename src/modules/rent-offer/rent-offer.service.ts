import { injectable, inject } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDto from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDto from './dto/update-rent-offer.dto.js';
import { DEFAULT_OFFERS_COUNT, MAX_PREMIUM_OFFERS_COUNT } from './rent-offer.constants.js';
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

  public async findById(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findById(offerId)
      .populate(['advertiserId'])
      .exec();
  }

  public async find(count?: number): Promise<DocumentType<RentOfferEntity>[]> {
    const limit = count ?? DEFAULT_OFFERS_COUNT;
    return this.rentOfferModel
      .find({}, {}, {limit})
      .sort({createdAt: SortType.Down})
      .exec();
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

  public async findPremium(city: string): Promise<DocumentType<RentOfferEntity>[]> {
    const limit = MAX_PREMIUM_OFFERS_COUNT;
    return this.rentOfferModel
      .find({'city.name': `${city}`, 'isPremium': true}, {}, {limit})
      .sort({createdAt: SortType.Down})
      .exec();
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel
      .findByIdAndUpdate(offerId, {'$inc': { commentCount: 1 }})
      .exec();
  }
}
