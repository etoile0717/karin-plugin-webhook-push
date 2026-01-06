import { describe, expect, it } from 'vitest';
import { verifyToken } from '../src/server/auth/verifyToken.js';

describe('verifyToken', () => {
  it('verifies matching token', () => {
    expect(verifyToken('token', 'token')).toBe(true);
  });

  it('rejects mismatched token', () => {
    expect(verifyToken('token', 'other')).toBe(false);
  });
});
