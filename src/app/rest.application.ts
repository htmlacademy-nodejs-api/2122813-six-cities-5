import {inject, injectable } from 'inversify';
import express, { Express } from 'express';

import { LoggerInterface } from '../core/logger/logger.interface.js';
import { ConfigInterface } from '../core/config/config.interface.js';
import { DatabaseClientInterface } from '../core/datdbase-client/database-client.interface.js';
import { RestSchema } from '../core/config/rest.schema.js';
import { AppComponent } from '../types/app-component.type.js';
import { getMongoURI } from '../core/utils/db-helper.js';
import { ControllerInterface } from '../core/controller/controller.interface.js';
import { ExceptionFilterInterface } from '../core/exception-filters/exception-filter.interface.js';
import { AuthenticateMiddleware } from '../core/middlewares/authenticate.middleware.js';

@injectable()
export default class RestApplication {
  private expressApplication: Express;

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.ConfigInterface) private readonly config: ConfigInterface<RestSchema>,
    @inject(AppComponent.DatabaseClientInterface) private readonly databaseClient: DatabaseClientInterface,
    @inject(AppComponent.RentOfferController) private readonly rentOfferController: ControllerInterface,
    @inject(AppComponent.UserController) private readonly userController: ControllerInterface,
    @inject(AppComponent.CommentController) private readonly commentController: ControllerInterface,
    @inject(AppComponent.ExceptionFilterInterface) private readonly exceptionFilter: ExceptionFilterInterface
  ) {
    this.expressApplication = express();
  }

  private async _initDb(): Promise<void> {
    this.logger.info('Init database...');

    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    await this.databaseClient.connect(mongoUri);

    this.logger.info('Init database completed');
  }

  private async _initServer() {
    this.logger.info('Try to init server...');

    const port = this.config.get('EXPRESS_PORT');
    this.expressApplication.listen(port);

    this.logger.info(`Server started on http://localhost:${port}`);
  }

  private async _initRoutes() {
    this.logger.info('Controller initialization...');

    this.expressApplication.use('/users', this.userController.router);
    this.expressApplication.use('/rent-offers', this.rentOfferController.router);
    this.expressApplication.use('/comments', this.commentController.router);

    this.logger.info('Controller initialization completed');
  }

  private async _initMiddleware() {
    this.logger.info('Global middleware initialization...');

    this.expressApplication.use(express.json());
    this.expressApplication.use(
      '/upload',
      express.static(this.config.get('UPLOAD_DIRECTORY')));

    this.logger.info('Global middleware initialization completed');
  }

  private async _initExceptionFilters() {
    this.logger.info('Exception filters initialization');

    this.expressApplication.use(this.exceptionFilter.catch.bind(this.exceptionFilter));

    const authenticateMiddleware = new AuthenticateMiddleware(this.config.get('JWT_SECRET'));
    this.expressApplication.use(authenticateMiddleware.execute.bind(authenticateMiddleware));

    this.logger.info('Exception filters completed');
  }

  public async init() {
    this.logger.info('Application initialization...');

    await this._initDb();
    await this._initMiddleware();
    await this._initRoutes();
    await this._initExceptionFilters();
    await this._initServer();
  }
}
