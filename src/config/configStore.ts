import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultConfig } from './defaultConfig.js';
import { normalizeConfig } from './normalizeConfig.js';
import { validateConfig } from './schema.js';
import { ConfigError } from '../utils/errors.js';
import type { PluginConfig } from '../server/types.js';
import { buildConfigPath, defaultPluginName, normalizePluginName } from './pluginPaths.js';

const findPackageJson = async (startDir: string): Promise<string | null> => {
  let current = startDir;
  while (current) {
    const candidate = path.join(current, 'package.json');
    try {
      await fs.access(candidate);
      return candidate;
    } catch (error) {
      if (error instanceof Error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        return null;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
};

const readPackageName = async (packagePath: string): Promise<string | undefined> => {
  try {
    const content = await fs.readFile(packagePath, 'utf8');
    const parsed = JSON.parse(content) as { name?: string };
    if (typeof parsed.name === 'string' && parsed.name.trim()) {
      return parsed.name;
    }
    return undefined;
  } catch (error) {
    // Ignore read/parse errors and fall back to the default plugin name.
    return undefined;
  }
};

const resolveConfigPath = async (): Promise<string> => {
  const karinRoot = process.cwd();
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const packagePath = await findPackageJson(moduleDir);
  const packageName = packagePath ? await readPackageName(packagePath) : undefined;
  const pluginName = normalizePluginName(packageName, defaultPluginName);
  return buildConfigPath(karinRoot, pluginName);
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
      const normalized = normalizeConfig(parsed);
      const validation = validateConfig(normalized.config);
      if (!validation.ok) {
        throw new ConfigError(`config validation failed: ${validation.errors.join('; ')}`);
      }
      if (normalized.migrated) {
        await fs.writeFile(configPath, JSON.stringify(normalized.config, null, 2), 'utf8');
        const updatedStats = await fs.stat(configPath);
        this.cachedMtime = updatedStats.mtimeMs;
      } else {
        this.cachedMtime = stats.mtimeMs;
      }
      this.cached = normalized.config;
      return normalized.config;
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
