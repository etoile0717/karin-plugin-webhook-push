import type { Rule, MatchResult } from '../types.js';

const matchRule = (routeKey: string, rule: Rule): boolean => {
  if (!rule.enabled) {
    return false;
  }
  if (rule.match.type === 'equals') {
    return routeKey === rule.match.value;
  }
  try {
    const regex = new RegExp(rule.match.value);
    return regex.test(routeKey);
  } catch {
    return false;
  }
};

export const matchRules = (routeKey: string, rules: Rule[]): MatchResult => {
  return {
    rules: rules.filter((rule) => matchRule(routeKey, rule))
  };
};
