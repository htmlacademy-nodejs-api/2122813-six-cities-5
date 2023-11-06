import * as crypto from 'node:crypto';
import * as jose from 'jose';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';

import { ValidationErrorField } from '../../types/validation-error-field.type.js';
import { ErrorType } from '../../types/error-type.type.js';
import { DEFAULT_STATIC_IMAGES } from '../../app/rest.constants.js';
import { ResBody } from '../../types/default-response.type.js';

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}
export const createSHA256 = (line: string, salt: string): string => {
  const shaHasher = crypto.createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
};
export function fillRDO<T, V>(someRDO: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someRDO, plainObject, { excludeExtraneousValues: true });
}
export function createErrorObject(errorType: ErrorType, message: string, details: ValidationErrorField[] = []) {
  return {
    errorType,
    message,
    details: [...details],
  };
}
export async function createJWT(algorithm: string, jwtSecret: string, payload: jose.JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(crypto.createSecretKey(jwtSecret, 'utf-8'));
}
export function transformErrors(errors: ValidationError[]): ValidationErrorField[] {
  return errors.map(({property, value, constraints}) => (
    {
      field: property,
      value,
      messages: constraints ? Object.values(constraints) : []
    }
  ));
}

export function getFullServerPath(host: string, port: number) {
  return `http://${host}:${port}`;
}

function isObject(value: unknown) {
  return typeof value === 'object' && value !== null;
}

export function transformProperty(property: string, srcObject: ResBody, transformFn: (object: ResBody) => void) {
  return Object.keys(srcObject).forEach((key) => {
    if (key === property) {
      transformFn(srcObject);
    } else if (isObject(srcObject[key])) {
      transformProperty(property, srcObject[key] as ResBody, transformFn);
    }
  });
}

export function transformData(properties: string[], staticPath: string, uploadPath: string, srcObject: ResBody) {
  return properties.forEach((property) => {
    transformProperty(property, srcObject, (target: ResBody) => {
      const rootPath = DEFAULT_STATIC_IMAGES.includes(target[property] as string) ? staticPath : uploadPath;
      target[property] = `${rootPath}/${target[property]}`;
    });
  });
}
