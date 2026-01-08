import type { Application, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { readBody } from './body/readBody.js';
import { verifyToken } from './auth/verifyToken.js';
import { extractRouteKey } from './routing/extractRouteKey.js';
import { matchRules } from './routing/ruleEngine.js';
import { renderMessage } from './render/renderMessage.js';
import type { PluginConfig, SendResult, Target } from './types.js';
import { RequestError } from '../utils/errors.js';
import { consoleLogger, type Logger } from '../utils/logger.js';
import { truncate } from '../utils/string.js';
import { isIpAllowed, normalizeIp } from './security/ipAllowlist.js';

export interface Contact {
  peer: string;
  scene: 'friend' | 'group';
}

export interface RegisterDeps {
  sendMsg: (selfId: string, contact: Contact, elements: string) => Promise<void>;
  contactFriend: (peer: string) => Contact;
  contactGroup: (peer: string) => Contact;
  authMiddleware?: (req: Request, res: Response, next: NextFunction) => void;
  logger?: Logger;
}

interface RateState {
  tokens: number;
  last: number;
}

const createRateLimiter = () => {
  const buckets = new Map<string, RateState>();
  return (ip: string, config: PluginConfig): boolean => {
    if (!config.rateLimit.enabled) {
      return true;
    }
    const now = Date.now();
    const state = buckets.get(ip) ?? { tokens: config.rateLimit.max, last: now };
    const elapsed = now - state.last;
    const refill = (elapsed / config.rateLimit.windowMs) * config.rateLimit.max;
    const tokens = Math.min(config.rateLimit.max, state.tokens + refill);
    if (tokens < 1) {
      buckets.set(ip, { tokens, last: now });
      return false;
    }
    buckets.set(ip, { tokens: tokens - 1, last: now });
    return true;
  };
};

const getClientIp = (req: Request): string | undefined => {
  const ip = req.ip ?? req.socket.remoteAddress;
  return ip ? normalizeIp(ip) : undefined;
};

const pickFirstString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.find((entry): entry is string => typeof entry === 'string');
  }
  return undefined;
};

const getAuthToken = (req: Request, config: PluginConfig): string | undefined => {
  if (config.auth.location === 'header') {
    const headerValue = req.headers[config.auth.fieldName.toLowerCase()] ??
      req.headers[config.auth.fieldName];
    return pickFirstString(headerValue);
  }
  const queryValue = req.query[config.auth.fieldName];
  return pickFirstString(queryValue);
};

const buildBodyText = (body: { raw: string; json: unknown | null; isJson: boolean }): string => {
  if (body.isJson) {
    const payload = body.json ?? {};
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return body.raw;
    }
  }
  return body.raw;
};

const summarizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return truncate(error.message, 200);
  }
  return 'unknown error';
};

const sendToTargets = async (
  deps: RegisterDeps,
  config: PluginConfig,
  message: string,
  ruleId: string,
  targets: Target[]
): Promise<SendResult[]> => {
  const results: SendResult[] = [];
  for (const target of targets) {
    const contact = target.type === 'friend' ? deps.contactFriend(target.id) : deps.contactGroup(target.id);
    try {
      await deps.sendMsg(config.bot.selfId, contact, message);
      results.push({ ruleId, target, success: true });
    } catch (error) {
      results.push({ ruleId, target, success: false, error: summarizeError(error) });
    }
  }
  return results;
};

export interface ConfigProvider {
  getConfig(): Promise<PluginConfig>;
}

export const registerRoutes = (app: Application, deps: RegisterDeps, store: ConfigProvider): void => {
  const logger = deps.logger ?? consoleLogger;
  const rateLimiter = createRateLimiter();

  app.post('/api/webhook-push', async (req: Request, res: Response) => {
    const requestId = randomUUID();
    try {
      const config = await store.getConfig();
      if (!config.enabled) {
        throw new RequestError(403, 'PLUGIN_DISABLED', 'plugin is disabled');
      }
      const clientIp = getClientIp(req);
      if (!isIpAllowed(config.ipAllowlist, clientIp)) {
        throw new RequestError(403, 'IP_NOT_ALLOWED', 'ip not allowed');
      }
      if (!rateLimiter(clientIp ?? 'unknown', config)) {
        throw new RequestError(429, 'RATE_LIMITED', 'rate limited');
      }
      if (config.auth.enabled) {
        const token = getAuthToken(req, config);
        if (!verifyToken(token, config.auth.token)) {
          throw new RequestError(401, 'UNAUTHORIZED', 'invalid token');
        }
      }
      const body = await readBody(req, config.bodyLimitBytes);
      const routeKey = extractRouteKey(
        {
          headers: req.headers as Record<string, string | string[] | undefined>,
          query: req.query as Record<string, string | string[] | undefined>,
          body: body.json ?? body.raw
        },
        config.routeKey
      );
      const matched = matchRules(routeKey, config.rules);
      const bodyText = buildBodyText(body);
      const results: SendResult[] = [];
      for (const rule of matched.rules) {
        const message = renderMessage({
          routeKey,
          payload: body.json ?? body.raw,
          bodyText,
          isJson: body.isJson,
          maxMessageChars: config.maxMessageChars,
          ...(rule.template ? { template: rule.template } : {})
        });
        const sendResults = await sendToTargets(deps, config, message, rule.id, rule.targets);
        results.push(...sendResults);
      }
      res.status(200).json({
        requestId,
        routeKey,
        matchedRules: matched.rules.map((rule) => ({ id: rule.id, name: rule.name })),
        results
      });
    } catch (error) {
      if (error instanceof RequestError) {
        res.status(error.status).json({
          requestId,
          error: { code: error.code, message: error.message }
        });
        return;
      }
      logger.error('webhook error', { requestId, error: summarizeError(error) });
      res.status(500).json({
        requestId,
        error: { code: 'INTERNAL_ERROR', message: 'internal error' }
      });
    }
  });

  app.get('/api/webhook-push/health', async (req: Request, res: Response, next: NextFunction) => {
    const config = await store.getConfig();
    if (config.debug.requireKarinAuth && deps.authMiddleware) {
      deps.authMiddleware(req, res, next);
      return;
    }
    next();
  }, async (_req: Request, res: Response) => {
    const config = await store.getConfig();
    res.json({
      ok: true,
      version: '0.1.0',
      enabled: config.enabled,
      rules: config.rules.length
    });
  });
};
