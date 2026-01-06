import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { registerRoutes } from '../src/server/registerRoutes.js';
import type { PluginConfig } from '../src/server/types.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

class TestConfigStore {
  constructor(private readonly config: PluginConfig) {}
  async getConfig(): Promise<PluginConfig> {
    return this.config;
  }
}

describe('registerRoutes', () => {
  it('handles webhook requests', async () => {
    const app = express();
    const sendMsg = vi.fn().mockResolvedValue(undefined);

    const config: PluginConfig = {
      ...defaultConfig,
      bot: { selfId: 'bot' },
      auth: {
        enabled: true,
        token: 'token',
        location: 'header',
        fieldName: 'X-Webhook-Token'
      },
      routeKey: {
        location: 'body',
        fieldName: 'route',
        defaultRouteKey: ''
      },
      rules: [
        {
          id: 'rule-1',
          name: 'match route',
          enabled: true,
          match: { type: 'equals', value: 'alpha' },
          targets: [{ type: 'friend', id: '123' }]
        }
      ]
    };

    registerRoutes(
      app,
      {
        sendMsg,
        contactFriend: (peer) => ({ peer, scene: 'friend' }),
        contactGroup: (peer) => ({ peer, scene: 'group' })
      },
      new TestConfigStore(config)
    );

    const response = await request(app)
      .post('/api/webhook-push')
      .set('X-Webhook-Token', 'token')
      .set('Content-Type', 'application/json')
      .send({ route: 'alpha', message: 'hello' });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(sendMsg).toHaveBeenCalledTimes(1);
  });
});
