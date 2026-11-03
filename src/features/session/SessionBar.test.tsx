import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { resetTestState } from '../../test-utils';
import { SessionBar } from './SessionBar';
import { useSessionStore } from './useSessionStore';

describe('SessionBar và CountdownBar', () => {
  beforeEach(() => { resetTestState(); vi.useFakeTimers(); });
  afterEach(() => vi.useRealTimers());

  it('hiện trạng thái chưa tập và khóa điều khiển khi chưa có bài', () => {
    render(<SessionBar />);
    expect(screen.getByText('Chưa bắt đầu buổi tập')).toBeInTheDocument();
    expect(screen.getByText('Còn lại:')).toHaveTextContent('Còn lại: 0:00');
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trước' })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('chạy mỗi giây, tạm dừng và tiếp tục mà không tạo timer trùng trong StrictMode', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    const { unmount } = render(<StrictMode><SessionBar /></StrictMode>);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Còn lại:')).toHaveTextContent('Còn lại: 0:25');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17');
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Còn lại:')).toHaveTextContent('0:25');
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Còn lại:')).toHaveTextContent('0:24');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(useSessionStore.getState().elapsed).toBe(6);
  });

  it('nút Sau và Trước chuyển bài; hết bài cuối dừng ở 0:00 và 100%', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    render(<SessionBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Đang tập: Kéo tạ đơn 1 – HLV Phương Anh')).toBeInTheDocument();
    expect(screen.getByText('Còn lại:')).toHaveTextContent('1:07');
    fireEvent.click(screen.getByRole('button', { name: 'Trước' }));
    expect(screen.getByText('Đang tập: Đẩy tạ đơn 1 – HLV Minh Khang')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(107000));
    expect(screen.getByText('Còn lại:')).toHaveTextContent('0:00');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeEnabled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('hiển thị đếm nghỉ, khóa đổi thời gian trong lúc nghỉ và tự chuyển bài khi hết nghỉ', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    render(<SessionBar />);
    fireEvent.change(screen.getByLabelText('Nghỉ giữa bài'), { target: { value: '20' } });
    expect(useSessionStore.getState().restDuration).toBe(20);
    fireEvent.change(screen.getByLabelText('Nghỉ giữa bài'), { target: { value: '10' } });
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('Đang nghỉ sau: Đẩy tạ đơn 1 – HLV Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('Nghỉ còn lại:')).toHaveTextContent('0:10');
    expect(screen.getByLabelText('Nghỉ giữa bài')).toBeDisabled();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('progressbar', { name: 'Tiến trình nghỉ' })).toHaveAttribute('aria-valuenow', '50');
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Nghỉ còn lại:')).toHaveTextContent('0:05');
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Đang tập: Kéo tạ đơn 1 – HLV Phương Anh')).toBeInTheDocument();
    expect(screen.getByText('Còn lại:')).toHaveTextContent('1:07');
    expect(screen.getByLabelText('Nghỉ giữa bài')).toBeEnabled();
  });
});
