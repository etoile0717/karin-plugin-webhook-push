import { describe, expect, it } from 'vitest';
import { extractRouteKey } from '../src/server/routing/extractRouteKey.js';

describe('extractRouteKey', () => {
  it('extracts from header', () => {
    const routeKey = extractRouteKey(
      {
        headers: { 'x-route-key': 'alpha' },
        query: {},
        body: null
      },
      { location: 'header', fieldName: 'X-Route-Key', defaultRouteKey: '' }
    );
    expect(routeKey).toBe('alpha');
  });

  it('falls back to default', () => {
    const routeKey = extractRouteKey(
      {
        headers: {},
        query: {},
        body: null
      },
      { location: 'query', fieldName: 'route', defaultRouteKey: 'fallback' }
    );
    expect(routeKey).toBe('fallback');
  });
});
