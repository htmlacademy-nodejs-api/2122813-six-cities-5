import 'reflect-metadata';
import { Container } from 'inversify';

import RestApplication from './app/rest.application.js';
import { AppComponent } from './types/app-component.type.js';
import { getErrorMessage } from './core/utils/common.js';
import { createRestApplicationContainer } from './app/rest.container.js';
import { createUserContainer } from './modules/user/user.container.js';
import { createRentOfferContainer } from './modules/rent-offer/rent-offer.container.js';

async function bootstrap() {
  const mainContainer = Container.merge(
    createRestApplicationContainer(),
    createUserContainer(),
    createRentOfferContainer()
  );

  const restApp = mainContainer.get<RestApplication>(AppComponent.RestApplication);
  await restApp.init();
}

bootstrap().catch((error) => {
  console.log(`Bootstrap Rest Application error: ${getErrorMessage(error)}`);
});
