import type { RouteKeyConfig } from '../types.js';
import { RequestError } from '../../utils/errors.js';
import { toStringValue } from '../../utils/string.js';

interface Source {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
}

const getFromBody = (body: unknown, fieldName: string): string | undefined => {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  return toStringValue(record[fieldName]);
};

export const extractRouteKey = (source: Source, config: RouteKeyConfig): string => {
  const fieldName = config.fieldName;
  let value: string | undefined;

  if (config.location === 'header') {
    const headerValue = source.headers[fieldName.toLowerCase()] ?? source.headers[fieldName];
    value = toStringValue(headerValue);
  }

  if (config.location === 'query') {
    value = toStringValue(source.query[fieldName]);
  }

  if (config.location === 'body') {
    value = getFromBody(source.body, fieldName);
  }

  if (!value) {
    if (config.defaultRouteKey) {
      return config.defaultRouteKey;
    }
    throw new RequestError(400, 'ROUTE_KEY_REQUIRED', 'routeKey is required');
  }
  return value;
};
