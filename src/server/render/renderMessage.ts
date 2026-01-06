import type { RenderContext } from '../types.js';
import { truncate } from '../../utils/string.js';
import { adapters } from '../adapters/index.js';

const defaultTemplate = '[Webhook][{{routeKey}}] {{summary}}\n{{bodyPreview}}';

const pickSummary = (payload: unknown): string => {
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    const candidates = [record.message, record.text, record.title];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }
  }
  return 'received webhook';
};

/**
 * Try to summarize payloads with registered adapters.
 */
export const summarizePayload = (payload: unknown): string | undefined => {
  for (const adapter of adapters) {
    if (adapter.canHandle(payload)) {
      const summary = adapter.summarize(payload);
      if (typeof summary === 'string' && summary.trim()) {
        return summary;
      }
    }
  }
  return undefined;
};

const renderTemplate = (template: string, data: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key] ?? '');
};

/**
 * Render message content from the webhook payload.
 */
export const renderMessage = (context: RenderContext): string => {
  const summary = summarizePayload(context.payload) ?? pickSummary(context.payload);
  const bodyPreview = truncate(context.bodyText, context.maxMessageChars);
  const template = context.template ?? defaultTemplate;
  return renderTemplate(template, {
    routeKey: context.routeKey,
    summary,
    bodyPreview
  });
};
