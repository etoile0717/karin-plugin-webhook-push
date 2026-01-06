import { feishuAdapter } from './feishu.js';
import { githubAdapter } from './github.js';

export interface WebhookAdapter {
  name: string;
  canHandle(payload: unknown): boolean;
  summarize(payload: unknown): string | undefined;
}

export const adapters: WebhookAdapter[] = [githubAdapter, feishuAdapter];
