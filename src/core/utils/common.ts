import * as crypto from 'node:crypto';


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
