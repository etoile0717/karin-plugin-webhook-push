import path from 'path';

const DEFAULT_PLUGIN_NAME = 'karin-plugin-webhook-push';

/**
 * Normalize the plugin package name into a config directory name.
 */
export const normalizePluginName = (name: string | undefined, fallback = DEFAULT_PLUGIN_NAME): string => {
  const rawName = typeof name === 'string' && name.trim() ? name.trim() : fallback;
  return rawName.replace(/\//g, '-');
};

/**
 * Build the absolute config.json path for the plugin.
 */
export const buildConfigPath = (karinRoot: string, pluginName: string): string => {
  return path.join(karinRoot, '@karinjs', pluginName, 'config', 'config.json');
};

/**
 * Default plugin name used when package.json cannot be read.
 */
export const defaultPluginName = DEFAULT_PLUGIN_NAME;
