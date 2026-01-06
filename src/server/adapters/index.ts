export interface WebhookAdapter {
  name: string;
  canHandle(payload: unknown): boolean;
  summarize(payload: unknown): string | undefined;
}

export const adapters: WebhookAdapter[] = [];
