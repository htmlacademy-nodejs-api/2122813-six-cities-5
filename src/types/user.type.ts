import type { UserStatus } from './user-status.type.js';

export type User = {
  username: string;
  email: string;
  status: UserStatus
}
