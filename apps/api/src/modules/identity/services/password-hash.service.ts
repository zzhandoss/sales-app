import { createHash } from 'node:crypto';

export class PasswordHashService {
  hash(plainText: string): string {
    return createHash('sha256').update(plainText).digest('hex');
  }

  verify(plainText: string, expectedHash: string): boolean {
    return this.hash(plainText) === expectedHash;
  }
}
