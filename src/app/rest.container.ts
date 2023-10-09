import 'reflect-metadata';
import { Container } from 'inversify';

import { ConfigInterface } from '../core/config/config.interface.js';
import ConfigService from '../core/config/config.service.js';
import { RestSchema } from '../core/config/rest.schema.js';
import { DatabaseClientInterface } from '../core/datdbase-client/database-client.interface.js';
import MongoClientService from '../core/datdbase-client/mongo-client.service.js';
import PinoLogger from '../core/logger/pino.logger.js';
import { LoggerInterface } from '../core/logger/logger.interface.js';
import { AppComponent } from '../types/app-component.type.js';
import RestApplication from './rest.application.js';

export function createRestApplicationContainer() {
  const restAppContainer = new Container();
  restAppContainer.bind<RestApplication>(AppComponent.RestApplication).to(RestApplication).inSingletonScope();
  restAppContainer.bind<LoggerInterface>(AppComponent.LoggerInterface).to(PinoLogger).inSingletonScope();
  restAppContainer.bind<ConfigInterface<RestSchema>>(AppComponent.ConfigInterface).to(ConfigService).inSingletonScope();
  restAppContainer.bind<DatabaseClientInterface>(AppComponent.DatabaseClientInterface).to(MongoClientService).inSingletonScope();

  return restAppContainer;
}
