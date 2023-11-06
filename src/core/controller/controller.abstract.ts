import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { ControllerInterface } from './controller.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { RouteInterface } from '../../types/route.interface.js';
import { ConfigInterface } from '../config/config.interface.js';
import { RestSchema } from '../config/rest.schema.js';
import { getFullServerPath, transformData } from '../utils/common.js';
import { STATIC_RESOURCE_FIELDS } from '../../app/rest.constants.js';
import { ResBody } from '../../types/default-response.type.js';

@injectable()
export abstract class Controller implements ControllerInterface {
  private readonly _router: Router;

  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly configService: ConfigInterface<RestSchema>
  ) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  protected addStaticPath(data: ResBody): void {
    const fullServerPath = getFullServerPath(this.configService.get('SERVICE_HOST'), this.configService.get('SERVICE_PORT'));
    transformData(
      STATIC_RESOURCE_FIELDS,
      `${fullServerPath}/${this.configService.get('STATIC_DIRECTORY_PATH')}`,
      `${fullServerPath}/${this.configService.get('UPLOAD_DIRECTORY_PATH')}`,
      data
    );
  }

  public addRoute(route: RouteInterface) {
    const {path, method, handler} = route;
    const routeHandler = asyncHandler(handler.bind(this));
    const middlewares = route.middlewares?.map(
      (middleware) => asyncHandler(middleware.execute.bind(middleware))
    );
    const allHandlers = middlewares ? [...middlewares, routeHandler] : routeHandler;
    this._router[method](path, allHandlers);
    this.logger.info(`Route registered: ${method.toUpperCase()} ${path}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    this.addStaticPath(data as ResBody);
    res
      .type('application/json')
      .status(statusCode)
      .json(data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.NO_CONTENT, data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }
}
