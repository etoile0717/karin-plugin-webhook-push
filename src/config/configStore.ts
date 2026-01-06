import { promises as fs } from 'fs';
import path from 'path';
import { defaultConfig } from './defaultConfig.js';
import { validateConfig } from './schema.js';
import { ConfigError } from '../utils/errors.js';
import type { PluginConfig } from '../server/types.js';

const resolveConfigPath = async (): Promise<string> => {
  const packagePath = path.join(process.cwd(), 'package.json');
  let name = 'karin-plugin-webhook-push';
  try {
    const content = await fs.readFile(packagePath, 'utf8');
    const parsed = JSON.parse(content) as { name?: string };
    if (parsed.name) {
      name = parsed.name.replace('/', '-');
    }
  } catch {
    name = 'karin-plugin-webhook-push';
  }
  return path.join(process.cwd(), `@karinjs/${name}`, 'config', 'config.json');
};

export class ConfigStore {
  private cached: PluginConfig | null = null;
  private cachedMtime = 0;

  async getConfig(): Promise<PluginConfig> {
    const configPath = await resolveConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    try {
      const stats = await fs.stat(configPath);
      if (this.cached && stats.mtimeMs === this.cachedMtime) {
        return this.cached;
      }
      const content = await fs.readFile(configPath, 'utf8');
      const parsed = JSON.parse(content) as unknown;
      const validation = validateConfig(parsed);
      if (!validation.ok) {
        throw new ConfigError(`config validation failed: ${validation.errors.join('; ')}`);
      }
      this.cached = parsed as PluginConfig;
      this.cachedMtime = stats.mtimeMs;
      return parsed as PluginConfig;
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        this.cached = defaultConfig;
        this.cachedMtime = 0;
        return defaultConfig;
      }
      throw new ConfigError('failed to read config');
    }
  }
}
