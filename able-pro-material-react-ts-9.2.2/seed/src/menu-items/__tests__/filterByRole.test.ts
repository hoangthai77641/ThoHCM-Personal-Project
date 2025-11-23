import { describe, it, expect } from 'vitest';
import { filterByRole } from '../index';

const items = [
  { id: 'a', title: 'AdminOnly', type: 'item', url: '/admin', roles: ['admin'] },
  { id: 'b', title: 'CustomerOnly', type: 'item', url: '/home', roles: ['customer'] },
  { id: 'c', title: 'AllNoRoles', type: 'item', url: '/common' }
] as any;

describe('filterByRole seed', () => {
  it('filters for admin', () => {
    const res = filterByRole(items, 'admin');
    expect(res.map(i => i.id)).toEqual(['a','c']);
  });
  it('filters for customer', () => {
    const res = filterByRole(items, 'customer');
    expect(res.map(i => i.id)).toEqual(['b','c']);
  });
  it('returns empty when role missing and items require role', () => {
    const res = filterByRole(items.filter(i=>i.id!=='c'), undefined);
    expect(res.length).toBe(0);
  });
});
