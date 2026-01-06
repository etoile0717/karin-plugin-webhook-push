import { describe, expect, it } from 'vitest';
import { renderMessage } from '../src/server/render/renderMessage.js';

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
});
