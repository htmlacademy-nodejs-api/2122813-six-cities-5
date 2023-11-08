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

export function transformDataStatic(staticProps: string[], staticPath: string, srcObject: ResBody) {
  return staticProps.forEach((property) => {
    transformProperty(property, srcObject, (target: ResBody) => {
      if (DEFAULT_STATIC_IMAGES.includes(target[property] as string)) {
        target[property] = `${staticPath}/${target[property]}`;
      }
    });
  });
}

export function transformDataUpload(staticProps: string[], uploadPaths: string[], srcObject: ResBody) {

  const [avatarPath, previewPath, imagesPath] = uploadPaths;

  return staticProps.forEach((property) => {
    transformProperty(property, srcObject, (target: ResBody) => {
      if (property === 'avatarPath') {
        target[property] = `${avatarPath}/${target[property]}`;
      } else if (property === 'previewImage') {
        target[property] = `${previewPath}/${target[property]}`;
      } else if (property === 'images') {
        target[property] = `${imagesPath}/${target[property]}`;
      }
    });
  });
}
