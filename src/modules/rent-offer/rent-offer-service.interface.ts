import {DocumentType} from '@typegoose/typegoose';

import { RentOfferEntity } from './rent-offer.entity.js';
import CreateRentOfferDTO from './dto/create-rent-offer.dto.js';
import UpdateRentOfferDTO from './dto/update-rent-offer.dto.js';
import { DocumentExistsInterface } from '../../types/document-exists.interface.js';
import { DocumentModifyInterface } from '../../types/document-modify.interface.js';

export interface RentOfferServiceInterface extends DocumentExistsInterface, DocumentModifyInterface {

  create(dto: CreateRentOfferDTO): Promise<DocumentType<RentOfferEntity>>;

  findById(offerId: string, userId?: string): Promise<DocumentType<RentOfferEntity> | null>;

  find(count: number, userId?: string): Promise<DocumentType<RentOfferEntity>[]>;

  updateById(offerId: string, dto: UpdateRentOfferDTO): Promise<DocumentType<RentOfferEntity> | null>;

  deleteById(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;

  findPremium(city: string, offersCount: number, userId?: string): Promise<DocumentType<RentOfferEntity>[]>

  incCommentCount(offerId: string): Promise<DocumentType<RentOfferEntity> | null>;

  updateRating(offerId: string) : Promise<DocumentType<RentOfferEntity> | null>;

  exists(offerId: string): Promise<boolean>;

  canModify(userId: string, offerId: string): Promise<boolean>;
}
