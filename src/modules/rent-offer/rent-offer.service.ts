import { injectable, inject } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';

import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDto from './dto/create-rent-offer.dto.js';


@injectable()
export default class RentOfferService implements RentOfferServiceInterface {

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>
  ) {}

  public async create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>> {
    const rentOfferEntry = await this.rentOfferModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return rentOfferEntry;
  }

  public async findById(offerId: string): Promise<DocumentType<RentOfferEntity> | null> {
    return this.rentOfferModel.findById(offerId).exec();
  }
}
