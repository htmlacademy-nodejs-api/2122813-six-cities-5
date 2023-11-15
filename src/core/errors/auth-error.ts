import { StatusCodes } from 'http-status-codes';
import HttpError from './http-error.js';

export default class AuthError extends HttpError {
  public details?: string;

  constructor(message: string, details?: string) {
    super(StatusCodes.UNAUTHORIZED, message);
    this.details = details;
  }
}
