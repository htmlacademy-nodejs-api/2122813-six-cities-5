import * as crypto from 'node:crypto';
import * as jose from 'jose';


import { ClassConstructor, plainToInstance } from 'class-transformer';

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

export function createErrorObject(message: string) {
  return { error: message };
}

export async function createJWT(algorithm: string, jwtSecret: string, payload: jose.JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(crypto.createSecretKey(jwtSecret, 'utf-8'));
}
