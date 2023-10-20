import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';

import { AppComponent } from '../../types/app-component.type.js';
import { RentOfferServiceInterface } from './rent-offer-service.interface.js';
import RentOfferService from './rent-offer.service.js';
import { RentOfferEntity } from './rent-offer.entity.js';
import { RentOfferModel } from '../entities/index.js';
import { ControllerInterface } from '../../core/controller/controller.interface.js';
import RentOfferController from './rent-offer.controller.js';

export function createRentOfferContainer() {
  const rentOfferContainer = new Container();

  rentOfferContainer.bind<RentOfferServiceInterface>(AppComponent.RentOfferServiceInterface).to(RentOfferService).inSingletonScope();
  rentOfferContainer.bind<types.ModelType<RentOfferEntity>>(AppComponent.RentOfferModel).toConstantValue(RentOfferModel);
  rentOfferContainer.bind<ControllerInterface>(AppComponent.RentOfferController).to(RentOfferController).inSingletonScope();

  return rentOfferContainer;
}
