import { describe, expect, it } from 'vitest';
import { matchRules } from '../src/server/routing/ruleEngine.js';

const rules = [
  {
    id: 'eq',
    name: 'equals',
    enabled: true,
    match: { type: 'equals' as const, value: 'alpha' },
    targets: [{ type: 'friend' as const, id: '1' }],
    priority: 200,
    stopOnMatch: false
  },
  {
    id: 'regex',
    name: 'regex',
    enabled: true,
    match: { type: 'regex' as const, value: '^prod-' },
    targets: [{ type: 'group' as const, id: '2' }],
    priority: 100,
    stopOnMatch: false
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

  it('sorts by priority then id', () => {
    const matchingRules = [
      {
        id: 'b',
        name: 'match b',
        enabled: true,
        match: { type: 'equals' as const, value: 'same' },
        targets: [{ type: 'friend' as const, id: '1' }],
        priority: 100,
        stopOnMatch: false
      },
      {
        id: 'a',
        name: 'match a',
        enabled: true,
        match: { type: 'equals' as const, value: 'same' },
        targets: [{ type: 'friend' as const, id: '2' }],
        priority: 100,
        stopOnMatch: false
      },
      {
        id: 'c',
        name: 'match c',
        enabled: true,
        match: { type: 'equals' as const, value: 'same' },
        targets: [{ type: 'friend' as const, id: '3' }],
        priority: 50,
        stopOnMatch: false
      }
    ];
    const result = matchRules('same', matchingRules);
    expect(result.rules.map((rule) => rule.id)).toEqual(['c', 'a', 'b']);
  });

  it('stops after stopOnMatch rule', () => {
    const matchingRules = [
      {
        id: 'first',
        name: 'first',
        enabled: true,
        match: { type: 'equals' as const, value: 'stop' },
        targets: [{ type: 'friend' as const, id: '1' }],
        priority: 10,
        stopOnMatch: true
      },
      {
        id: 'second',
        name: 'second',
        enabled: true,
        match: { type: 'equals' as const, value: 'stop' },
        targets: [{ type: 'friend' as const, id: '2' }],
        priority: 20,
        stopOnMatch: false
      }
    ];
    const result = matchRules('stop', matchingRules);
    expect(result.rules.map((rule) => rule.id)).toEqual(['first']);
  });
});
