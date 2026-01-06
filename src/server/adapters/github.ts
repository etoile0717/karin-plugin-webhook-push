import type { WebhookAdapter } from './index.js';

/**
 * Placeholder adapter for GitHub webhook payloads.
 */
export const githubAdapter: WebhookAdapter = {
  name: 'github',
  canHandle: () => false,
  summarize: () => undefined
};
