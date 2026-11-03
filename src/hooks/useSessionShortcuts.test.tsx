import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../data/exercises';
import { useSessionStore } from '../features/session/useSessionStore';
import { resetTestState } from '../test-utils';
import { useSessionShortcuts } from './useSessionShortcuts';

describe('useSessionShortcuts', () => {
  beforeEach(() => {
    resetTestState();
    useSessionStore.getState().addToSession(EXERCISES[0]);
  });

  it('Space bắt đầu hoặc tạm dừng, ngăn cuộn trang và gỡ listener khi unmount', () => {
    const { unmount } = renderHook(() => useSessionShortcuts());
    expect(fireEvent.keyDown(window, { key: ' ', code: 'Space' })).toBe(false);
    expect(useSessionStore.getState().isRunning).toBe(true);
    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    expect(useSessionStore.getState().isRunning).toBe(false);
    unmount();
    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    expect(useSessionStore.getState().isRunning).toBe(false);
  });

  it('bỏ qua Space trong ô nhập, select, nút, link và nội dung có thể sửa', () => {
    renderHook(() => useSessionShortcuts());
    render(<>
      <input aria-label="Tìm kiếm" />
      <textarea aria-label="Ghi chú" />
      <select aria-label="Nhóm cơ"><option>Tất cả</option></select>
      <button type="button">Điều khiển</button>
      <a href="/">Kho</a>
      <div contentEditable suppressContentEditableWarning><span>Nội dung sửa được</span></div>
      <div role="textbox" aria-label="Trình soạn thảo" />
    </>);
    const targets = [
      screen.getByLabelText('Tìm kiếm'), screen.getByLabelText('Ghi chú'), screen.getByLabelText('Nhóm cơ'),
      screen.getByRole('button'), screen.getByRole('link'), screen.getByText('Nội dung sửa được'), screen.getByLabelText('Trình soạn thảo'),
    ];
    for (const target of targets) fireEvent.keyDown(target, { key: ' ', code: 'Space' });
    expect(useSessionStore.getState().isRunning).toBe(false);
  });

  it('bỏ qua giữ phím, tổ hợp phím, phím khác, nhập bộ gõ và sự kiện đã xử lý', () => {
    renderHook(() => useSessionShortcuts());
    for (const options of [{ repeat: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { isComposing: true }]) {
      fireEvent.keyDown(window, { key: ' ', code: 'Space', ...options });
    }
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
    const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true });
    event.preventDefault();
    window.dispatchEvent(event);
    expect(useSessionStore.getState().isRunning).toBe(false);
  });
});
