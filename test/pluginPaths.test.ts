import path from 'path';
import { describe, expect, it } from 'vitest';
import { buildConfigPath, normalizePluginName } from '../src/config/pluginPaths.js';

describe('pluginPaths', () => {
  it('normalizes scoped package names', () => {
    expect(normalizePluginName('@scope/plug', 'fallback')).toBe('@scope-plug');
  });

  it('falls back to default when name is missing', () => {
    expect(normalizePluginName('', 'fallback')).toBe('fallback');
    expect(normalizePluginName(undefined, 'fallback')).toBe('fallback');
  });

  it('builds config path under karin root', () => {
    const result = buildConfigPath('/srv/karin', 'my-plugin');
    expect(result).toBe(path.join('/srv/karin', '@karinjs', 'my-plugin', 'config', 'config.json'));
  });
});
