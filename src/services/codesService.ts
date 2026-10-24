import { SecretCode } from '../types';

/**
 * Generates a random alphanumeric code of specified length.
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a new Secret Code entity.
 */
export function createSecretCode(
  rewardType: SecretCode['rewardType'],
  rewardValue: number | string,
  maxUses: number = 1
): SecretCode {
  return {
    code: generateRandomString(8),
    rewardType,
    rewardValue,
    maxUses,
    currentUses: 0,
    active: true,
    createdAt: Date.now(),
  };
}

/**
 * Validates if a code can be used.
 */
export function canUseCode(code: SecretCode): boolean {
  if (!code.active) return false;
  if (code.maxUses > 0 && code.currentUses >= code.maxUses) return false;
  return true;
}
