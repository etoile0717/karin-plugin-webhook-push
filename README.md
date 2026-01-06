# karin-plugin-webhook-push

Karin v1.x 插件：通过 Karin 内置 HTTP Server (默认 7777) 接收 Webhook，并按照 `routeKey` 分流推送到指定 QQ 好友或群。

## 功能概览

- POST `/api/webhook-push` 接收 Webhook
- `routeKey` 从 Header/Query/Body 提取（字段名可配置）
- 按规则匹配推送目标（好友/群）
- Web 配置页面可视化配置（支持 JSON 规则校验）
- 预留 adapters 结构，便于扩展 GitHub/飞书等 Webhook 解析

## 安装

在 Karin 插件目录中安装：

```bash
npm install karin-plugin-webhook-push
```

## 最小配置示例

`@karinjs/karin-plugin-webhook-push/config/config.json`

```json
{
  "enabled": true,
  "bot": {
    "selfId": "123456"
  },
  "auth": {
    "enabled": true,
    "token": "your-token",
    "location": "header",
    "fieldName": "X-Webhook-Token"
  },
  "routeKey": {
    "location": "header",
    "fieldName": "X-Route-Key",
    "defaultRouteKey": ""
  },
  "bodyLimitBytes": 262144,
  "maxMessageChars": 800,
  "rateLimit": {
    "enabled": true,
    "windowMs": 60000,
    "max": 30
  },
  "debug": {
    "requireKarinAuth": true
  },
  "rules": [
    {
      "id": "default",
      "name": "推送到好友",
      "enabled": true,
      "match": {
        "type": "equals",
        "value": "alerts"
      },
      "targets": [
        { "type": "friend", "id": "123456789" }
      ]
    }
  ]
}
```

## Webhook 调用示例

```bash
curl -X POST \
  http://localhost:7777/api/webhook-push \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Token: your-token' \
  -H 'X-Route-Key: alerts' \
  -d '{"message":"Hello from webhook","extra":"data"}'
```

## 路由说明

- `POST /api/webhook-push`
  - 认证：`auth.enabled=true` 时必填 token，默认 header 字段 `X-Webhook-Token`
  - `routeKey` 提取：默认 header 字段 `X-Route-Key`
- `GET /api/webhook-push/health`
  - 返回：`ok`、插件版本、是否启用、规则数量
  - `debug.requireKarinAuth=true` 时要求 Karin 的 authMiddleware

## 配置说明

- `enabled`：启用插件
- `bot.selfId`：发送消息的机器人 ID
- `auth`：Webhook 鉴权配置
- `routeKey`：routeKey 提取位置及字段
- `rules`：规则列表，支持 `equals` 或 `regex` 匹配
- `rateLimit`：按 IP 的简单速率限制
- `maxMessageChars`：消息内容截断长度

## 本地开发与测试

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
