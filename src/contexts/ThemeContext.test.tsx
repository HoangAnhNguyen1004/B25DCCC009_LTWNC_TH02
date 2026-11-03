import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetTestState } from '../test-utils';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  beforeEach(resetTestState);

  it('đổi sáng/tối trên document và giữ ổn định hàm toggle', () => {
    const { result, rerender } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    const initialValue = result.current;
    rerender();
    expect(result.current).toBe(initialValue);
    expect(document.documentElement.dataset.theme).toBe('light');
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(result.current.toggleTheme).toBe(initialValue.toggleTheme);
    expect(document.documentElement.dataset.theme).toBe('dark');
    act(() => result.current.toggleTheme());
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('báo lỗi khi dùng hook ngoài ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme phải được dùng bên trong ThemeProvider');
  });
});
