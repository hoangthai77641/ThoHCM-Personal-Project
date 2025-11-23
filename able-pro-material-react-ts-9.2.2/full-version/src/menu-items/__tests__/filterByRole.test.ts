import { describe, it, expect } from 'vitest';
import { filterByRole } from '../index';

const items = [
  { id: 'a', title: 'AdminOnly', type: 'item', url: '/admin', roles: ['admin'] },
  { id: 'b', title: 'WorkerOnly', type: 'item', url: '/work', roles: ['worker'] },
  { id: 'c', title: 'Shared', type: 'item', url: '/common' }
] as any;

describe('filterByRole admin app', () => {
  it('filters for admin', () => {
    const res = filterByRole(items, 'admin');
    expect(res.map(i => i.id)).toEqual(['a','c']);
  });
  it('filters for worker', () => {
    const res = filterByRole(items, 'worker');
    expect(res.map(i => i.id)).toEqual(['b','c']);
  });
  it('returns empty when role missing excluding shared removal rule', () => {
    const res = filterByRole(items.filter(i=>i.id!=='c'), undefined);
    expect(res.length).toBe(0);
  });
});
