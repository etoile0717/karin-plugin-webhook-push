import type { IpAllowlistConfig } from '../types.js';

/**
 * Normalize IP strings to a comparable format.
 */
export const normalizeIp = (ip: string): string => {
  if (ip.startsWith('::ffff:')) {
    return ip.slice('::ffff:'.length);
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
};

/**
 * Check whether an IP is allowed by the allowlist settings.
 */
export const isIpAllowed = (config: IpAllowlistConfig, ip: string | undefined | null): boolean => {
  if (!config.enabled) {
    return true;
  }
  if (!ip) {
    return false;
  }
  const normalized = normalizeIp(ip);
  return config.ips.includes(normalized);
};
