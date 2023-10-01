import RestApplication from './app/rest.js';
import PinoLogger from './core/logger/pino.logger.js';
import ConfigService from './core/config/config.service.js';

async function bootstrap() {
  const logger = new PinoLogger();
  const config = new ConfigService(logger);

  const application = new RestApplication(logger, config);
  await application.init();
}

bootstrap();
