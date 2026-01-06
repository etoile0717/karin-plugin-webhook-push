import type { PluginConfig, Rule } from '../server/types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

const validateRule = (rule: unknown, index: number, errors: string[]): rule is Rule => {
  if (!isRecord(rule)) {
    errors.push(`rules[${index}] must be an object`);
    return false;
  }
  if (!isString(rule.id) || !rule.id) {
    errors.push(`rules[${index}].id must be a non-empty string`);
  }
  if (!isString(rule.name) || !rule.name) {
    errors.push(`rules[${index}].name must be a non-empty string`);
  }
  if (!isBoolean(rule.enabled)) {
    errors.push(`rules[${index}].enabled must be a boolean`);
  }
  if (!isRecord(rule.match)) {
    errors.push(`rules[${index}].match must be an object`);
  } else {
    if (rule.match.type !== 'equals' && rule.match.type !== 'regex') {
      errors.push(`rules[${index}].match.type must be equals or regex`);
    }
    if (!isString(rule.match.value) || !rule.match.value) {
      errors.push(`rules[${index}].match.value must be a non-empty string`);
    } else if (rule.match.type === 'regex') {
      try {
        new RegExp(rule.match.value);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid regex';
        errors.push(`rules[${index}].match.value is not a valid regex: ${message}`);
      }
    }
  }
  if (!Array.isArray(rule.targets) || rule.targets.length === 0) {
    errors.push(`rules[${index}].targets must be a non-empty array`);
  } else {
    rule.targets.forEach((target, targetIndex) => {
      if (!isRecord(target)) {
        errors.push(`rules[${index}].targets[${targetIndex}] must be an object`);
        return;
      }
      if (target.type !== 'friend' && target.type !== 'group') {
        errors.push(`rules[${index}].targets[${targetIndex}].type must be friend or group`);
      }
      if (!isString(target.id) || !target.id) {
        errors.push(`rules[${index}].targets[${targetIndex}].id must be a non-empty string`);
      }
    });
  }
  if (rule.template !== undefined && !isString(rule.template)) {
    errors.push(`rules[${index}].template must be a string`);
  }
  if (!isNumber(rule.priority)) {
    errors.push(`rules[${index}].priority must be a number`);
  }
  if (!isBoolean(rule.stopOnMatch)) {
    errors.push(`rules[${index}].stopOnMatch must be a boolean`);
  }
  return true;
};

export const validateConfig = (value: unknown): { ok: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, errors: ['config must be an object'] };
  }

  if (!isBoolean(value.enabled)) {
    errors.push('enabled must be a boolean');
  }
  if (!isRecord(value.bot) || !isString(value.bot.selfId) || !value.bot.selfId) {
    errors.push('bot.selfId must be a non-empty string');
  }
  if (!isRecord(value.auth)) {
    errors.push('auth must be an object');
  } else {
    if (!isBoolean(value.auth.enabled)) {
      errors.push('auth.enabled must be a boolean');
    }
    if (!isString(value.auth.token)) {
      errors.push('auth.token must be a string');
    } else if (value.auth.enabled === true && !value.auth.token.trim()) {
      errors.push('auth.token must be a non-empty string when auth.enabled is true');
    }
    if (value.auth.location !== 'header' && value.auth.location !== 'query') {
      errors.push('auth.location must be header or query');
    }
    if (!isString(value.auth.fieldName) || !value.auth.fieldName) {
      errors.push('auth.fieldName must be a non-empty string');
    }
  }

  if (!isRecord(value.ipAllowlist)) {
    errors.push('ipAllowlist must be an object');
  } else {
    if (!isBoolean(value.ipAllowlist.enabled)) {
      errors.push('ipAllowlist.enabled must be a boolean');
    }
    if (!Array.isArray(value.ipAllowlist.ips)) {
      errors.push('ipAllowlist.ips must be an array');
    } else if (value.ipAllowlist.ips.some((ip) => !isString(ip) || !ip.trim())) {
      errors.push('ipAllowlist.ips must be an array of non-empty strings');
    }
  }

  if (!isRecord(value.routeKey)) {
    errors.push('routeKey must be an object');
  } else {
    if (value.routeKey.location !== 'header' && value.routeKey.location !== 'query' && value.routeKey.location !== 'body') {
      errors.push('routeKey.location must be header, query, or body');
    }
    if (!isString(value.routeKey.fieldName) || !value.routeKey.fieldName) {
      errors.push('routeKey.fieldName must be a non-empty string');
    }
    if (!isString(value.routeKey.defaultRouteKey)) {
      errors.push('routeKey.defaultRouteKey must be a string');
    }
  }

  if (!isNumber(value.bodyLimitBytes) || value.bodyLimitBytes <= 0) {
    errors.push('bodyLimitBytes must be a positive number');
  }
  if (!isNumber(value.maxMessageChars) || value.maxMessageChars <= 0) {
    errors.push('maxMessageChars must be a positive number');
  }
  if (!isRecord(value.rateLimit)) {
    errors.push('rateLimit must be an object');
  } else {
    if (!isBoolean(value.rateLimit.enabled)) {
      errors.push('rateLimit.enabled must be a boolean');
    }
    if (!isNumber(value.rateLimit.windowMs) || value.rateLimit.windowMs <= 0) {
      errors.push('rateLimit.windowMs must be a positive number');
    }
    if (!isNumber(value.rateLimit.max) || value.rateLimit.max <= 0) {
      errors.push('rateLimit.max must be a positive number');
    }
  }

  if (!isRecord(value.debug)) {
    errors.push('debug must be an object');
  } else {
    if (!isBoolean(value.debug.requireKarinAuth)) {
      errors.push('debug.requireKarinAuth must be a boolean');
    }
  }

  if (!Array.isArray(value.rules)) {
    errors.push('rules must be an array');
  } else {
    value.rules.forEach((rule, index) => {
      validateRule(rule, index, errors);
    });
    const seen = new Set<string>();
    value.rules.forEach((rule, index) => {
      if (isRecord(rule) && isString(rule.id)) {
        if (seen.has(rule.id)) {
          errors.push(`rules[${index}].id must be unique`);
        } else {
          seen.add(rule.id);
        }
      }
    });
  }

  return { ok: errors.length === 0, errors };
};

export const isPluginConfig = (value: unknown): value is PluginConfig => validateConfig(value).ok;
