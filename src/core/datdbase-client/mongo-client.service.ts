import { setTimeout } from 'node:timers/promises';

import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import type { Mongoose } from 'mongoose';

import { DatabaseClientInterface } from './database-client.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import ConfigService from '../config/config.service.js';

const DB_CONNECTION_TIMEOUT = 5000;
const RETRY = {
  COUNT: 5,
  TIMEOUT: 1000
};

@injectable()
export default class MongoClientService implements DatabaseClientInterface {
  private mongooseInstance: Mongoose | null = null;
  private isConnected = false;

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.ConfigInterface) private readonly configService: ConfigService
  ) {}

  private async _connectWithRetry(uri: string): Promise<Mongoose> {
    let attempt = 0;
    while (attempt < RETRY.COUNT) {
      try {
        return await mongoose.connect(uri, {serverSelectionTimeoutMS: DB_CONNECTION_TIMEOUT});
      } catch (error) {
        attempt++;
        this.logger.error(`Failed to connect to the database. Attempt ${attempt}`);
        await setTimeout(RETRY.TIMEOUT);
        this.logger.error(`${attempt !== RETRY.COUNT ? 'Reconnecting...' : 'Attempts limit exceeded.'}`);
      }
    }

    this.logger.error('Unable to establish database connection');
    throw new Error('Failed to connect to the database');
  }

  private async _connect(uri:string): Promise<void> {
    this.mongooseInstance = await this._connectWithRetry(uri);
    this.isConnected = true;
  }

  private async _disconnect(): Promise<void> {
    await this.mongooseInstance?.disconnect();
    this.isConnected = false;
    this.mongooseInstance = null;
  }

  public async connect(uri = this.configService.get('CLI_CONNECT_DB_PATH')): Promise<void> {
    if (this.isConnected) {
      throw new Error('MongoDB client already connected');
    }

    this.logger.info('Trying to connect to MongoDB...');
    await this._connect(uri);
    this.logger.info('Database connection established.');
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to the database');
    }

    await this._disconnect();
    this.logger.info('Database connection closed.');
  }
}
