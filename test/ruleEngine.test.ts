import { describe, expect, it } from 'vitest';
import { matchRules } from '../src/server/routing/ruleEngine.js';

const rules = [
  {
    id: 'eq',
    name: 'equals',
    enabled: true,
    match: { type: 'equals' as const, value: 'alpha' },
    targets: [{ type: 'friend' as const, id: '1' }]
  },
  {
    id: 'regex',
    name: 'regex',
    enabled: true,
    match: { type: 'regex' as const, value: '^prod-' },
    targets: [{ type: 'group' as const, id: '2' }]
  }
];

describe('ruleEngine', () => {
  it('matches rules by routeKey', () => {
    const result = matchRules('alpha', rules);
    expect(result.rules.map((rule) => rule.id)).toEqual(['eq']);
  });

  it('matches regex rules', () => {
    const result = matchRules('prod-alert', rules);
    expect(result.rules.map((rule) => rule.id)).toEqual(['regex']);
  });
});
