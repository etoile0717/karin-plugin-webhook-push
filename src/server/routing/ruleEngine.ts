import type { Rule, MatchResult } from '../types.js';

const matchRule = (routeKey: string, rule: Rule): boolean => {
  if (rule.match.type === 'equals') {
    return routeKey === rule.match.value;
  }
  try {
    const regex = new RegExp(rule.match.value);
    return regex.test(routeKey);
  } catch (error) {
    // Invalid regex should have been validated earlier.
    return false;
  }
};

export const matchRules = (routeKey: string, rules: Rule[]): MatchResult => {
  const enabledRules = rules.filter((rule) => rule.enabled);
  const sortedRules = [...enabledRules].sort((a, b) => {
    const priorityDiff = a.priority - b.priority;
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return a.id.localeCompare(b.id);
  });
  const matched: Rule[] = [];
  for (const rule of sortedRules) {
    if (matchRule(routeKey, rule)) {
      matched.push(rule);
      if (rule.stopOnMatch) {
        break;
      }
    }
  }
  return { rules: matched };
};
