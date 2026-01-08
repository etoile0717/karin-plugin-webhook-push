import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../src/config/normalizeConfig.js';

describe('normalizeConfig', () => {
  it('fills defaults for new fields without breaking existing data', () => {
    const input = {
      enabled: true,
      bot: { selfId: '123' },
      auth: {
        enabled: false,
        token: '',
        location: 'header',
        fieldName: 'X-Webhook-Token'
      },
      routeKey: {
        location: 'header',
        fieldName: 'X-Route-Key',
        defaultRouteKey: ''
      },
      bodyLimitBytes: 1024,
      maxMessageChars: 200,
      rateLimit: {
        enabled: true,
        windowMs: 1000,
        max: 5
      },
      debug: {
        requireKarinAuth: true
      },
      rules: [
        {
          id: 'rule-1',
          name: 'rule',
          enabled: true,
          match: { type: 'equals', value: 'alpha' },
          targets: [{ type: 'friend', id: '1' }]
        }
      ]
    };

    const normalized = normalizeConfig(input);

    expect(normalized.config.ipAllowlist.enabled).toBe(false);
    const rule = normalized.config.rules[0];
    expect(rule).toBeDefined();
    if (!rule) {
      throw new Error('expected at least one rule');
    }
    expect(rule.priority).toBe(100);
    expect(rule.stopOnMatch).toBe(false);
    expect(normalized.migrated).toBe(true);
  });
});
