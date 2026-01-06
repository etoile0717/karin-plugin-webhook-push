import { defaultConfig } from './defaultConfig.js';
import type {
  AuthConfig,
  BotConfig,
  DebugConfig,
  IpAllowlistConfig,
  PluginConfig,
  RateLimitConfig,
  RouteKeyConfig,
  Rule,
  RuleMatch,
  Target
} from '../server/types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

/**
 * Result for config normalization.
 */
export interface NormalizedConfigResult {
  config: PluginConfig;
  migrated: boolean;
}

const normalizeTarget = (value: unknown, markMigrated: () => void): Target => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const type = record?.type === 'friend' || record?.type === 'group' ? record.type : 'friend';
  if (record?.type !== 'friend' && record?.type !== 'group') {
    markMigrated();
  }
  const id = isString(record?.id) ? record?.id : '';
  if (!isString(record?.id)) {
    markMigrated();
  }
  return { type, id };
};

const normalizeRuleMatch = (value: unknown, markMigrated: () => void): RuleMatch => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const type = record?.type === 'equals' || record?.type === 'regex' ? record.type : 'equals';
  if (record?.type !== 'equals' && record?.type !== 'regex') {
    markMigrated();
  }
  const matchValue = isString(record?.value) ? record.value : '';
  if (!isString(record?.value)) {
    markMigrated();
  }
  return { type, value: matchValue };
};

const normalizeRule = (value: unknown, markMigrated: () => void): Rule => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const id = isString(record?.id) ? record.id : '';
  if (!isString(record?.id)) {
    markMigrated();
  }
  const name = isString(record?.name) ? record.name : '';
  if (!isString(record?.name)) {
    markMigrated();
  }
  const enabled = isBoolean(record?.enabled) ? record.enabled : true;
  if (!isBoolean(record?.enabled)) {
    markMigrated();
  }
  const targets = Array.isArray(record?.targets)
    ? record.targets.map((target) => normalizeTarget(target, markMigrated))
    : [];
  if (!Array.isArray(record?.targets)) {
    markMigrated();
  }
  const template = record?.template;
  if (template !== undefined && !isString(template)) {
    markMigrated();
  }
  const priority = isNumber(record?.priority) ? record.priority : 100;
  if (!isNumber(record?.priority)) {
    markMigrated();
  }
  const stopOnMatch = isBoolean(record?.stopOnMatch) ? record.stopOnMatch : false;
  if (!isBoolean(record?.stopOnMatch)) {
    markMigrated();
  }
  return {
    id,
    name,
    enabled,
    match: normalizeRuleMatch(record?.match, markMigrated),
    targets,
    ...(template !== undefined && isString(template) ? { template } : {}),
    priority,
    stopOnMatch
  };
};

const normalizeAuth = (value: unknown, markMigrated: () => void): AuthConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const enabled = isBoolean(record?.enabled) ? record.enabled : defaultConfig.auth.enabled;
  if (!isBoolean(record?.enabled)) {
    markMigrated();
  }
  const token = isString(record?.token) ? record.token : defaultConfig.auth.token;
  if (!isString(record?.token)) {
    markMigrated();
  }
  const location = record?.location === 'header' || record?.location === 'query' ? record.location : defaultConfig.auth.location;
  if (record?.location !== 'header' && record?.location !== 'query') {
    markMigrated();
  }
  const fieldName = isString(record?.fieldName) ? record.fieldName : defaultConfig.auth.fieldName;
  if (!isString(record?.fieldName)) {
    markMigrated();
  }
  return { enabled, token, location, fieldName };
};

const normalizeRouteKey = (value: unknown, markMigrated: () => void): RouteKeyConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const location =
    record?.location === 'header' || record?.location === 'query' || record?.location === 'body'
      ? record.location
      : defaultConfig.routeKey.location;
  if (record?.location !== 'header' && record?.location !== 'query' && record?.location !== 'body') {
    markMigrated();
  }
  const fieldName = isString(record?.fieldName) ? record.fieldName : defaultConfig.routeKey.fieldName;
  if (!isString(record?.fieldName)) {
    markMigrated();
  }
  const defaultRouteKey = isString(record?.defaultRouteKey) ? record.defaultRouteKey : defaultConfig.routeKey.defaultRouteKey;
  if (!isString(record?.defaultRouteKey)) {
    markMigrated();
  }
  return { location, fieldName, defaultRouteKey };
};

const normalizeRateLimit = (value: unknown, markMigrated: () => void): RateLimitConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const enabled = isBoolean(record?.enabled) ? record.enabled : defaultConfig.rateLimit.enabled;
  if (!isBoolean(record?.enabled)) {
    markMigrated();
  }
  const windowMs = isNumber(record?.windowMs) ? record.windowMs : defaultConfig.rateLimit.windowMs;
  if (!isNumber(record?.windowMs)) {
    markMigrated();
  }
  const max = isNumber(record?.max) ? record.max : defaultConfig.rateLimit.max;
  if (!isNumber(record?.max)) {
    markMigrated();
  }
  return { enabled, windowMs, max };
};

const normalizeDebug = (value: unknown, markMigrated: () => void): DebugConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const requireKarinAuth = isBoolean(record?.requireKarinAuth) ? record.requireKarinAuth : defaultConfig.debug.requireKarinAuth;
  if (!isBoolean(record?.requireKarinAuth)) {
    markMigrated();
  }
  return { requireKarinAuth };
};

const normalizeBot = (value: unknown, markMigrated: () => void): BotConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const selfId = isString(record?.selfId) ? record.selfId : defaultConfig.bot.selfId;
  if (!isString(record?.selfId)) {
    markMigrated();
  }
  return { selfId };
};

const normalizeIpAllowlist = (value: unknown, markMigrated: () => void): IpAllowlistConfig => {
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const enabled = isBoolean(record?.enabled) ? record.enabled : defaultConfig.ipAllowlist.enabled;
  if (!isBoolean(record?.enabled)) {
    markMigrated();
  }
  const ips = Array.isArray(record?.ips) && record.ips.every((ip) => isString(ip))
    ? record.ips
    : defaultConfig.ipAllowlist.ips;
  if (!Array.isArray(record?.ips) || !record.ips.every((ip) => isString(ip))) {
    markMigrated();
  }
  return { enabled, ips };
};

/**
 * Normalize user config by filling defaults for missing fields.
 */
export const normalizeConfig = (value: unknown): NormalizedConfigResult => {
  let migrated = false;
  const markMigrated = (): void => {
    migrated = true;
  };
  const record = isRecord(value) ? value : undefined;
  if (!record) {
    markMigrated();
  }
  const enabled = isBoolean(record?.enabled) ? record.enabled : defaultConfig.enabled;
  if (!isBoolean(record?.enabled)) {
    markMigrated();
  }
  const bot = normalizeBot(record?.bot, markMigrated);
  const auth = normalizeAuth(record?.auth, markMigrated);
  const routeKey = normalizeRouteKey(record?.routeKey, markMigrated);
  const bodyLimitBytes = isNumber(record?.bodyLimitBytes) ? record.bodyLimitBytes : defaultConfig.bodyLimitBytes;
  if (!isNumber(record?.bodyLimitBytes)) {
    markMigrated();
  }
  const maxMessageChars = isNumber(record?.maxMessageChars) ? record.maxMessageChars : defaultConfig.maxMessageChars;
  if (!isNumber(record?.maxMessageChars)) {
    markMigrated();
  }
  const rateLimit = normalizeRateLimit(record?.rateLimit, markMigrated);
  const debug = normalizeDebug(record?.debug, markMigrated);
  const ipAllowlist = normalizeIpAllowlist(record?.ipAllowlist, markMigrated);
  const rules = Array.isArray(record?.rules) ? record.rules.map((rule) => normalizeRule(rule, markMigrated)) : defaultConfig.rules;
  if (!Array.isArray(record?.rules)) {
    markMigrated();
  }

  return {
    config: {
      enabled,
      bot,
      auth,
      routeKey,
      bodyLimitBytes,
      maxMessageChars,
      rateLimit,
      debug,
      ipAllowlist,
      rules
    },
    migrated
  };
};
