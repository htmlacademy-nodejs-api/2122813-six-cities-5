import {inject, injectable } from 'inversify';
import express, { Express } from 'express';

import { LoggerInterface } from '../core/logger/logger.interface.js';
import { ConfigInterface } from '../core/config/config.interface.js';
import { DatabaseClientInterface } from '../core/datdbase-client/database-client.interface.js';
import { RestSchema } from '../core/config/rest.schema.js';
import { AppComponent } from '../types/app-component.type.js';
import { getMongoURI } from '../core/utils/db-helper.js';

@injectable()
export default class RestApplication {
  private expressApplication: Express;

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.ConfigInterface) private readonly config: ConfigInterface<RestSchema>,
    @inject(AppComponent.DatabaseClientInterface) private readonly databaseClient: DatabaseClientInterface
  ) {
    this.expressApplication = express();
  }

  private async _initDb(): Promise<void> {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    return this.databaseClient.connect(mongoUri);
  }

  private async _initServer() {
    this.logger.info('Try to init server...');

    const port = this.config.get('EXPRESS_PORT');
    this.expressApplication.listen(port);

    this.logger.info(`Server started on http://localhost:${port}`);
  }

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Get value from env PORT: ${this.config.get('EXPRESS_PORT')}`);
    this.logger.info('Init database...');
    await this._initDb();
    this.logger.info('Init database completed');
    await this._initServer();
  }
}
