import {DocumentType} from '@typegoose/typegoose';

import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDto from './create-rent-offer.dto.js';

export interface RentOfferServiceInterface {
  create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>>;
  findById(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;
}
