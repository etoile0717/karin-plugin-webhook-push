export type RouteKeyLocation = 'header' | 'query' | 'body';

export type MatchType = 'equals' | 'regex';

export type TargetType = 'friend' | 'group';

export interface Target {
  type: TargetType;
  id: string;
}

export interface RuleMatch {
  type: MatchType;
  value: string;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  match: RuleMatch;
  targets: Target[];
  template?: string;
  priority: number;
  stopOnMatch: boolean;
}

export interface AuthConfig {
  enabled: boolean;
  token: string;
  location: 'header' | 'query';
  fieldName: string;
}

export interface RouteKeyConfig {
  location: RouteKeyLocation;
  fieldName: string;
  defaultRouteKey: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
}

export interface IpAllowlistConfig {
  enabled: boolean;
  ips: string[];
}

export interface DebugConfig {
  requireKarinAuth: boolean;
}

export interface BotConfig {
  selfId: string;
}

export interface PluginConfig {
  enabled: boolean;
  bot: BotConfig;
  auth: AuthConfig;
  ipAllowlist: IpAllowlistConfig;
  routeKey: RouteKeyConfig;
  bodyLimitBytes: number;
  maxMessageChars: number;
  rateLimit: RateLimitConfig;
  debug: DebugConfig;
  rules: Rule[];
}

export interface ReadBodyResult {
  raw: string;
  json: unknown | null;
  isJson: boolean;
}

export interface MatchResult {
  rules: Rule[];
}

export interface RenderContext {
  routeKey: string;
  payload: unknown;
  bodyText: string;
  isJson: boolean;
  maxMessageChars: number;
  template?: string;
}

export interface SendResult {
  ruleId: string;
  target: Target;
  success: boolean;
  error?: string;
}
