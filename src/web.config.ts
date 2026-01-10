import { components, defineConfig } from 'node-karin';
import { defaultConfig } from './config/defaultConfig.js';
import { normalizeConfig } from './config/normalizeConfig.js';
import { validateConfig } from './config/schema.js';
import { ConfigStore } from './config/configStore.js';
import type { PluginConfig, Rule } from './server/types.js';

const toBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

const toString = (value: unknown, fallback: string): string => (typeof value === 'string' ? value : fallback);

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const parseIpList = (value: unknown): string[] => {
  if (typeof value !== 'string') {
    return [];
  }
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseRulesJson = (value: unknown): { ok: true; rules: Rule[] } | { ok: false; message: string } => {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: true, rules: [] };
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return { ok: false, message: '规则必须是 JSON 数组' };
    }
    return { ok: true, rules: parsed as Rule[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid json';
    return { ok: false, message: `规则 JSON 解析失败: ${message}` };
  }
};

export default defineConfig({
  info: {
    name: 'Webhook Push',
    title: 'Webhook Push',
    description: 'Receive webhook requests and push messages to QQ contacts.'
  },
  components: async () => [
    components.switch('enabled', {
      label: '启用插件',
      description: '控制插件是否启用',
      defaultValue: defaultConfig.enabled
    }),
    components.input('botSelfId', {
      label: 'Bot SelfId',
      description: '用于发送消息的机器人账号',
      defaultValue: defaultConfig.bot.selfId,
      required: true
    }),
    components.switch('authEnabled', {
      label: 'Webhook 鉴权启用',
      defaultValue: defaultConfig.auth.enabled
    }),
    components.password('authToken', {
      label: 'Webhook Token',
      description: '用于鉴权的 Token',
      defaultValue: defaultConfig.auth.token
    }),
    components.radio('authLocation', {
      label: 'Token 位置',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Query', value: 'query' }
      ],
      defaultValue: defaultConfig.auth.location
    }),
    components.input('authFieldName', {
      label: 'Token 字段名',
      defaultValue: defaultConfig.auth.fieldName
    }),
    components.radio('routeKeyLocation', {
      label: 'routeKey 位置',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Query', value: 'query' },
        { label: 'Body', value: 'body' }
      ],
      defaultValue: defaultConfig.routeKey.location
    }),
    components.input('routeKeyFieldName', {
      label: 'routeKey 字段名',
      defaultValue: defaultConfig.routeKey.fieldName
    }),
    components.input('routeKeyDefaultRouteKey', {
      label: '默认 routeKey',
      defaultValue: defaultConfig.routeKey.defaultRouteKey
    }),
    components.number('bodyLimitBytes', {
      label: 'Body 大小限制 (bytes)',
      defaultValue: defaultConfig.bodyLimitBytes
    }),
    components.number('maxMessageChars', {
      label: '消息最大字符数',
      defaultValue: defaultConfig.maxMessageChars
    }),
    components.switch('rateLimitEnabled', {
      label: '速率限制启用',
      defaultValue: defaultConfig.rateLimit.enabled
    }),
    components.number('rateLimitWindowMs', {
      label: '速率限制窗口 (ms)',
      defaultValue: defaultConfig.rateLimit.windowMs
    }),
    components.number('rateLimitMax', {
      label: '窗口内最大请求数',
      defaultValue: defaultConfig.rateLimit.max
    }),
    components.switch('ipAllowlistEnabled', {
      label: 'IP 白名单启用',
      defaultValue: defaultConfig.ipAllowlist.enabled
    }),
    components.textarea('ipAllowlistIps', {
      label: '允许的 IP 列表',
      description: '一行一个 IP',
      defaultValue: defaultConfig.ipAllowlist.ips.join('\n')
    }),
    components.textarea('rulesJson', {
      label: '规则 (JSON 数组)',
      description: '填写规则 JSON 数组',
      defaultValue: JSON.stringify(defaultConfig.rules, null, 2)
    })
  ],
  save: async (form) => {
    const parsedRules = parseRulesJson(form.rulesJson);
    if (!parsedRules.ok) {
      return { success: false, message: parsedRules.message };
    }

    const config: PluginConfig = {
      enabled: toBoolean(form.enabled, defaultConfig.enabled),
      bot: {
        selfId: toString(form.botSelfId, defaultConfig.bot.selfId)
      },
      auth: {
        enabled: toBoolean(form.authEnabled, defaultConfig.auth.enabled),
        token: toString(form.authToken, defaultConfig.auth.token),
        location: form.authLocation === 'query' ? 'query' : 'header',
        fieldName: toString(form.authFieldName, defaultConfig.auth.fieldName)
      },
      ipAllowlist: {
        enabled: toBoolean(form.ipAllowlistEnabled, defaultConfig.ipAllowlist.enabled),
        ips: parseIpList(form.ipAllowlistIps)
      },
      routeKey: {
        location:
          form.routeKeyLocation === 'query' || form.routeKeyLocation === 'body' ? form.routeKeyLocation : 'header',
        fieldName: toString(form.routeKeyFieldName, defaultConfig.routeKey.fieldName),
        defaultRouteKey: toString(form.routeKeyDefaultRouteKey, defaultConfig.routeKey.defaultRouteKey)
      },
      bodyLimitBytes: toNumber(form.bodyLimitBytes, defaultConfig.bodyLimitBytes),
      maxMessageChars: toNumber(form.maxMessageChars, defaultConfig.maxMessageChars),
      rateLimit: {
        enabled: toBoolean(form.rateLimitEnabled, defaultConfig.rateLimit.enabled),
        windowMs: toNumber(form.rateLimitWindowMs, defaultConfig.rateLimit.windowMs),
        max: toNumber(form.rateLimitMax, defaultConfig.rateLimit.max)
      },
      debug: {
        requireKarinAuth: defaultConfig.debug.requireKarinAuth
      },
      rules: parsedRules.rules
    };

    const normalized = normalizeConfig(config);
    const validation = validateConfig(normalized.config);
    if (!validation.ok) {
      return { success: false, message: `配置校验失败: ${validation.errors.join('; ')}` };
    }

    const store = new ConfigStore();
    await store.saveConfig(normalized.config);
    return { success: true, message: '保存成功' };
  }
});
