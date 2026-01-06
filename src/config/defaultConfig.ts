import type { PluginConfig } from '../server/types.js';

export const defaultConfig: PluginConfig = {
  enabled: true,
  bot: {
    selfId: ''
  },
  auth: {
    enabled: true,
    token: '',
    location: 'header',
    fieldName: 'X-Webhook-Token'
  },
  routeKey: {
    location: 'header',
    fieldName: 'X-Route-Key',
    defaultRouteKey: ''
  },
  bodyLimitBytes: 256 * 1024,
  maxMessageChars: 800,
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 30
  },
  debug: {
    requireKarinAuth: true
  },
  rules: []
};
