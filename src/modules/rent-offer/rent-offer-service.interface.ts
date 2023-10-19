import {DocumentType} from '@typegoose/typegoose';

import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDto from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDto from './dto/update-rent-offer.dto.js';

export interface RentOfferServiceInterface {
  create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>>;

  findById(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;

  find(count?: number): Promise<DocumentType<RentOfferEntity>[]>;

  updateById(offerId: string, dto: UpdateRentOfferDto): Promise<DocumentType<RentOfferEntity> | null>;

  deleteById(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;

  findPremium(city: string): Promise<DocumentType<RentOfferEntity>[]>

  incCommentCount(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;
}
