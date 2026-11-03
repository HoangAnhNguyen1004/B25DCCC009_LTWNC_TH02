import { describe, expect, it, vi } from 'vitest';
import { withLogger } from './withLogger';

describe('withLogger', () => {
  it('ghi tên action và state trước/sau trong chế độ phát triển, giữ đúng kết quả reducer', () => {
    vi.stubEnv('DEV', true);
    const reducer = vi.fn((state: number, action: { type: string; amount: number }) => state + action.amount);
    const action = { type: 'create', amount: 2 };
    expect(withLogger(reducer)(1, action)).toBe(3);
    expect(reducer).toHaveBeenCalledExactlyOnceWith(1, action);
    expect(console.log).toHaveBeenCalledExactlyOnceWith('create', 'State trước:', 1, 'State sau:', 3);
  });

  it('không ghi log trong production', () => {
    vi.stubEnv('DEV', false);
    const reducer = withLogger((state: number, action: { type: string }) => action.type === 'next' ? state + 1 : state);
    expect(reducer(1, { type: 'next' })).toBe(2);
    expect(console.log).not.toHaveBeenCalled();
  });
});
