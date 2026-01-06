import { defineConfig } from 'node-karin';
import { defaultConfig } from '../config/defaultConfig.js';
import { normalizeConfig } from '../config/normalizeConfig.js';
import { validateConfig } from '../config/schema.js';

const validateRules = (value: string): { ok: boolean; message?: string } => {
  try {
    const parsed = JSON.parse(value) as unknown;
    const normalized = normalizeConfig({ ...defaultConfig, rules: parsed });
    const result = validateConfig(normalized.config);
    if (!result.ok) {
      return { ok: false, message: result.errors.join('; ') };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid json';
    return { ok: false, message };
  }
};

const validateIpList = (value: string): { ok: boolean; message?: string } => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return { ok: false, message: 'must be an array of IP strings' };
    }
    if (parsed.some((ip) => typeof ip !== 'string' || !ip.trim())) {
      return { ok: false, message: 'all IPs must be non-empty strings' };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid json';
    return { ok: false, message };
  }
};

export default defineConfig({
  name: 'Webhook Push',
  title: 'Webhook Push',
  description: 'Receive webhook requests and push messages to QQ contacts.',
  schema: [
    {
      field: 'enabled',
      label: '启用插件',
      component: 'switch',
      defaultValue: defaultConfig.enabled
    },
    {
      field: 'bot.selfId',
      label: 'Bot SelfId',
      component: 'input',
      defaultValue: defaultConfig.bot.selfId,
      required: true
    },
    {
      field: 'auth.enabled',
      label: 'Webhook 鉴权启用',
      component: 'switch',
      defaultValue: defaultConfig.auth.enabled
    },
    {
      field: 'auth.token',
      label: 'Webhook Token',
      component: 'input',
      defaultValue: defaultConfig.auth.token
    },
    {
      field: 'auth.location',
      label: 'Token 位置',
      component: 'select',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Query', value: 'query' }
      ],
      defaultValue: defaultConfig.auth.location
    },
    {
      field: 'auth.fieldName',
      label: 'Token 字段名',
      component: 'input',
      defaultValue: defaultConfig.auth.fieldName
    },
    {
      field: 'ipAllowlist.enabled',
      label: 'IP 白名单启用',
      component: 'switch',
      defaultValue: defaultConfig.ipAllowlist.enabled
    },
    {
      field: 'ipAllowlist.ips',
      label: '允许的 IP 列表 (JSON 数组)',
      component: 'json',
      defaultValue: JSON.stringify(defaultConfig.ipAllowlist.ips, null, 2),
      validator: validateIpList
    },
    {
      field: 'routeKey.location',
      label: 'routeKey 位置',
      component: 'select',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Query', value: 'query' },
        { label: 'Body', value: 'body' }
      ],
      defaultValue: defaultConfig.routeKey.location
    },
    {
      field: 'routeKey.fieldName',
      label: 'routeKey 字段名',
      component: 'input',
      defaultValue: defaultConfig.routeKey.fieldName
    },
    {
      field: 'routeKey.defaultRouteKey',
      label: '默认 routeKey',
      component: 'input',
      defaultValue: defaultConfig.routeKey.defaultRouteKey
    },
    {
      field: 'bodyLimitBytes',
      label: 'Body 大小限制 (bytes)',
      component: 'number',
      defaultValue: defaultConfig.bodyLimitBytes
    },
    {
      field: 'maxMessageChars',
      label: '消息最大字符数',
      component: 'number',
      defaultValue: defaultConfig.maxMessageChars
    },
    {
      field: 'rateLimit.enabled',
      label: '速率限制启用',
      component: 'switch',
      defaultValue: defaultConfig.rateLimit.enabled
    },
    {
      field: 'rateLimit.windowMs',
      label: '速率限制窗口 (ms)',
      component: 'number',
      defaultValue: defaultConfig.rateLimit.windowMs
    },
    {
      field: 'rateLimit.max',
      label: '窗口内最大请求数',
      component: 'number',
      defaultValue: defaultConfig.rateLimit.max
    },
    {
      field: 'debug.requireKarinAuth',
      label: 'Health 接口要求 Karin Auth',
      component: 'switch',
      defaultValue: defaultConfig.debug.requireKarinAuth
    },
    {
      field: 'rules',
      label: '规则 (JSON)',
      component: 'json',
      defaultValue: JSON.stringify(defaultConfig.rules, null, 2),
      validator: validateRules
    }
  ]
});
