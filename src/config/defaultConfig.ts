import type { PluginConfig } from '../server/types.js';

export const defaultConfig: PluginConfig = {
  enabled: true,
  bot: {
    selfId: 'YOUR_BOT_ID'
  },
  auth: {
    enabled: true,
    token: 'CHANGE_ME',
    location: 'header',
    fieldName: 'X-Webhook-Token'
  },
  ipAllowlist: {
    enabled: false,
    ips: []
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
