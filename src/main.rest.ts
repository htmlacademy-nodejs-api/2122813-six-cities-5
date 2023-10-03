import 'reflect-metadata';
import { Container } from 'inversify';

import RestApplication from './app/rest.js';
import PinoLogger from './core/logger/pino.logger.js';
import ConfigService from './core/config/config.service.js';
import { LoggerInterface } from './core/logger/logger.interface.js';
import { ConfigInterface } from './core/config/config.interface.js';
import { RestSchema } from './core/config/rest.schema.js';
import { RestAppComponent } from './types/rest-app-component.type.js';

async function bootstrap() {
  const container = new Container();

  container.bind<RestApplication>(RestAppComponent.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<LoggerInterface>(RestAppComponent.LoggerInterface).to(PinoLogger).inSingletonScope();
  container.bind<ConfigInterface<RestSchema>>(RestAppComponent.ConfigInterface).to(ConfigService).inSingletonScope();

  const restApp = container.get<RestApplication>(RestAppComponent.RestApplication);
  await restApp.init();
}

bootstrap().catch((error) => {
  console.log('Bootstrap Rest Application error: ', error);
});
