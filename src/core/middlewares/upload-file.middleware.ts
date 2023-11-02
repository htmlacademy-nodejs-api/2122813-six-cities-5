import { NextFunction, Request, Response } from 'express';
import multer, { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';
import { MiddlewareInterface } from './middleware.interface.js';
import HttpError from '../errors/http-error.js';

export class UploadFileMiddleware implements MiddlewareInterface {
  constructor(
    private uploadDirectory: string,
    private reqFieldName: string,
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {

    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const extension = file.originalname.split('.').pop();
        if (!extension || !allowedExtensions.includes(extension)) {
          return next(new HttpError(StatusCodes.BAD_REQUEST, 'incorrect file extension', 'File validation'));
        }
        const fileId = nanoid();
        callback(null, `${fileId}.${extension}`);
      }
    });
    const uploadSingleFileMiddleware = multer({storage})
      .single(this.reqFieldName);
    uploadSingleFileMiddleware(req, res, next);
  }
}
