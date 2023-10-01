import RestApplication from './app/rest.js';
import PinoLogger from './core/logger/pino.logger.js';

async function bootstrap() {
  const logger = new PinoLogger();

  const application = new RestApplication(logger);
  await application.init();
}

bootstrap();
