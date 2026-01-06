import type { WebhookAdapter } from './index.js';

/**
 * Placeholder adapter for Feishu webhook payloads.
 */
export const feishuAdapter: WebhookAdapter = {
  name: 'feishu',
  canHandle: () => false,
  summarize: () => undefined
};
