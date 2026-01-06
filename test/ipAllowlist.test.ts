import { describe, expect, it } from 'vitest';
import { isIpAllowed, normalizeIp } from '../src/server/security/ipAllowlist.js';

describe('ipAllowlist', () => {
  it('normalizes IPv6-mapped IPv4 addresses', () => {
    expect(normalizeIp('::ffff:127.0.0.1')).toBe('127.0.0.1');
  });

  it('treats ::1 as localhost', () => {
    expect(normalizeIp('::1')).toBe('127.0.0.1');
  });

  it('allows IPs when disabled', () => {
    expect(isIpAllowed({ enabled: false, ips: [] }, undefined)).toBe(true);
  });

  it('checks allowed IPs when enabled', () => {
    const config = { enabled: true, ips: ['127.0.0.1', '10.0.0.1'] };
    expect(isIpAllowed(config, '::ffff:127.0.0.1')).toBe(true);
    expect(isIpAllowed(config, '10.0.0.2')).toBe(false);
  });
});
