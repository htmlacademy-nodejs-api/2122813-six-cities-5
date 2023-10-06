import 'reflect-metadata';
import { Container } from 'inversify';

import RestApplication from './app/rest.application.js';
import PinoLogger from './core/logger/pino.logger.js';
import ConfigService from './core/config/config.service.js';
import { MongoDatabaseClient } from './core/datdbase-client/mongo-client.service.js';

import { LoggerInterface } from './core/logger/logger.interface.js';
import { ConfigInterface } from './core/config/config.interface.js';
import { RestSchema } from './core/config/rest.schema.js';
import { AppComponent } from './types/app-component.type.js';
import { DatabaseClientInterface } from './core/datdbase-client/database-client.interface.js';

async function bootstrap() {
  const container = new Container();

  container.bind<RestApplication>(AppComponent.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<LoggerInterface>(AppComponent.LoggerInterface).to(PinoLogger).inSingletonScope();
  container.bind<ConfigInterface<RestSchema>>(AppComponent.ConfigInterface).to(ConfigService).inSingletonScope();
  container.bind<DatabaseClientInterface>(AppComponent.DatabaseClientInterface).to(MongoDatabaseClient).inSingletonScope();

  const restApp = container.get<RestApplication>(AppComponent.RestApplication);
  await restApp.init();
}

bootstrap().catch((error) => {
  console.log('Bootstrap Rest Application error: ', error);
});
