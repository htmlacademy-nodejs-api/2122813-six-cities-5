import {inject, injectable } from 'inversify';

import { LoggerInterface } from '../core/logger/logger.interface.js';
import { ConfigInterface } from '../core/config/config.interface.js';
import { RestSchema } from '../core/config/rest.schema.js';
import { RestAppComponent } from '../types/rest-app-component.type.js';

@injectable()
export default class RestApplication {
  constructor(
    @inject(RestAppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(RestAppComponent.ConfigInterface) private readonly config: ConfigInterface<RestSchema>,
  ) {}

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);
  }
}
