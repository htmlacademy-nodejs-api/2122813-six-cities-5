import {mkdir, access, readdir, unlink} from 'node:fs/promises';
import path from 'node:path';

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
    const {offerId} = req.params;

    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    const destPath = path.join(
      this.uploadDirectory,
      `${res.locals.user.id}`,
      `${offerId ? path.join('offers', `${offerId}`) : ''}`,
      `${this.reqFieldName}`);

    await access(destPath).catch(async () => {
      await mkdir(destPath, { recursive: true });
    });

    for (const file of await readdir(destPath)) {
      await unlink(path.join(destPath, file));
    }

    const storage = diskStorage({
      destination: destPath,
      filename: (_request, file, callback) => {
        const extension = file.originalname.split('.').pop();
        if (!extension || !allowedExtensions.includes(extension)) {
          return next(new HttpError(StatusCodes.BAD_REQUEST, 'incorrect file extension', 'File validation'));
        }
        const fileId = nanoid();
        callback(null, `${fileId}.${extension}`);
      }
    });

    const uploadMiddleware = this.reqFieldName === 'images'
      ? multer({storage}).array(this.reqFieldName, 6)
      : multer({storage}).single(this.reqFieldName);

    uploadMiddleware(req, res, next);
  }
}
