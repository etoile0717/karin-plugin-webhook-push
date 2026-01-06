# karin-plugin-webhook-push

Karin v1.x 插件：通过 Karin 内置 HTTP Server (默认 7777) 接收 Webhook，并按照 `routeKey` 分流推送到指定 QQ 好友或群。

## 功能概览

- POST `/api/webhook-push` 接收 Webhook
- `routeKey` 从 Header/Query/Body 提取（字段名可配置）
- 按规则匹配推送目标（好友/群）
- 规则支持优先级与命中终止
- IP 白名单可选开关（仅精确 IP）
- Web 配置页面可视化配置（支持 JSON 规则校验）
- 预留 adapters 结构，便于扩展 GitHub/飞书等 Webhook 解析

## 安装

在 Karin 根目录执行安装（即 Karin 的 `package.json` 所在目录）：

```bash
npm install karin-plugin-webhook-push
```

或者将仓库放置到 Karin 插件目录（通常为 `<KARIN_ROOT>/@karinjs/karin-plugin-webhook-push`）。

## 配置文件路径

配置文件固定为：

```
<KARIN_ROOT>/@karinjs/<plugin-name>/config/config.json
```

其中 `<plugin-name>` 来源于插件自身的 `package.json` 的 `name`，并将 `/` 替换为 `-`。

## 最小配置示例

`@karinjs/karin-plugin-webhook-push/config/config.json`

```json
{
  "enabled": true,
  "bot": {
    "selfId": "YOUR_BOT_ID"
  },
  "auth": {
    "enabled": true,
    "token": "CHANGE_ME",
    "location": "header",
    "fieldName": "X-Webhook-Token"
  },
  "ipAllowlist": {
    "enabled": false,
    "ips": []
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
      ],
      "priority": 100,
      "stopOnMatch": false
    }
  ]
}
```

## Web 配置页面说明

在 Karin 的 Web 配置页面找到 `Webhook Push` 插件：

- `Webhook Token`：与调用方约定的 token（建议使用随机字符串）
- `routeKey` 相关字段：决定从 Header / Query / Body 取值
- `规则 (JSON)`：规则数组（支持 `priority` / `stopOnMatch`）

## Webhook 调用示例

### Header routeKey + Header token

```bash
curl -X POST \
  http://localhost:7777/api/webhook-push \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Token: your-token' \
  -H 'X-Route-Key: alerts' \
  -d '{"message":"Hello from webhook","extra":"data"}'
```

### Query routeKey + Header token

```bash
curl -X POST \
  'http://localhost:7777/api/webhook-push?routeKey=alerts' \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Token: your-token' \
  -d '{"message":"hello"}'
```

### Body routeKey + Query token

```bash
curl -X POST \
  'http://localhost:7777/api/webhook-push?token=your-token' \
  -H 'Content-Type: application/json' \
  -d '{"route":"alerts","message":"hello"}'
```

## 路由说明

- `POST /api/webhook-push`
  - 认证：`auth.enabled=true` 时必填 token，默认 header 字段 `X-Webhook-Token`
  - `routeKey` 提取：默认 header 字段 `X-Route-Key`
  - IP 白名单：`ipAllowlist.enabled=true` 时仅允许 `ips` 列表内的精确 IP
- `GET /api/webhook-push/health`
  - 返回：`ok`、插件版本、是否启用、规则数量
  - `debug.requireKarinAuth=true` 时要求 Karin 的 authMiddleware

## 配置说明

- `enabled`：启用插件
- `bot.selfId`：发送消息的机器人 ID（必须非空）
- `auth`：Webhook 鉴权配置
- `ipAllowlist`：IP 白名单配置（仅精确 IP）
- `routeKey`：routeKey 提取位置及字段
- `rules`：规则列表，支持 `equals` 或 `regex` 匹配
  - `priority`：越小越优先
  - `stopOnMatch`：命中后停止后续规则
- `rateLimit`：按 IP 的简单速率限制
- `maxMessageChars`：消息内容截断长度

## 安全建议

- 不要直接暴露 Karin 的 7777 端口到公网
- token 不要提交到 Git 仓库
- 需要公网访问时建议通过反代 + 访问控制（如 IP 白名单）

## npm install 403 解决方法

若在本环境安装依赖时遇到 `403 Forbidden`：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

安装完成后可切回默认源：

```bash
npm config set registry https://registry.npmjs.org
```

也可以使用辅助脚本：

- `scripts/install-with-registry-fallback.sh`
- `scripts/install-with-registry-fallback.ps1`

> 注意：不要把 `.npmrc` 提交到仓库。

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
