import { describe, expect, it } from 'vitest';
import { renderMessage } from '../src/server/render/renderMessage.js';
import { adapters } from '../src/server/adapters/index.js';

describe('renderMessage', () => {
  it('renders default template', () => {
    const message = renderMessage({
      routeKey: 'alpha',
      payload: { message: 'hello' },
      bodyText: '{"message":"hello"}',
      isJson: true,
      maxMessageChars: 200
    });
    expect(message).toContain('[Webhook][alpha] hello');
  });

  it('uses custom template', () => {
    const message = renderMessage({
      routeKey: 'beta',
      payload: { text: 'ping' },
      bodyText: 'ping',
      isJson: false,
      maxMessageChars: 200,
      template: 'Route={{routeKey}} {{summary}}'
    });
    expect(message).toBe('Route=beta ping');
  });

  it('prefers adapter summary when available', () => {
    const adapter = {
      name: 'test',
      canHandle: () => true,
      summarize: () => 'adapter summary'
    };
    adapters.unshift(adapter);
    try {
      const message = renderMessage({
        routeKey: 'gamma',
        payload: { message: 'fallback' },
        bodyText: 'payload',
        isJson: false,
        maxMessageChars: 200
      });
      expect(message).toContain('adapter summary');
    } finally {
      adapters.shift();
    }
  });
});
