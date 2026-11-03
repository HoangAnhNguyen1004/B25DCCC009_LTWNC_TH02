import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('giữ giá trị cũ trước 300ms và cập nhật đúng khi đủ 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: '' } });
    rerender({ value: 'đẩy' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('đẩy');
  });

  it('tính lại thời gian chờ từ lần thay đổi cuối', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: '' } });
    rerender({ value: 'đ' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'đẩy' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('đẩy');
  });

  it('hỗ trợ giá trị generic và hủy timer khi unmount', () => {
    const initial = { keyword: '' };
    const updated = { keyword: 'vai' };
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: initial } });
    rerender({ value: updated });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(updated);
    rerender({ value: initial });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
