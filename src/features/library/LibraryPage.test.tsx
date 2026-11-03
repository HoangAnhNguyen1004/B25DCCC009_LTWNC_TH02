import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { renderWithProviders, resetTestState } from '../../test-utils';
import { SessionBar } from '../session/SessionBar';
import { useSessionStore } from '../session/useSessionStore';
import LibraryPage from './LibraryPage';

describe('LibraryPage', () => {
  beforeEach(resetTestState);
  afterEach(() => vi.useRealTimers());

  it('hiện 10.000 kết quả nhưng chỉ dựng khoảng 10–15 dòng bài tập trong DOM', () => {
    renderWithProviders(<LibraryPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 10000 bài tập');
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows.length).toBeLessThanOrEqual(15);
    expect(rows[0]).toHaveStyle({ height: '56px' });
    expect(screen.getByLabelText('Giáo án đang chọn')).toBeDisabled();
  });

  it('chờ đủ 300ms mới tìm tên bài và kết hợp được với bộ lọc nhóm cơ', () => {
    vi.useFakeTimers();
    renderWithProviders(<LibraryPage />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), { target: { value: 'ĐẨY' } });
    act(() => vi.advanceTimersByTime(299));
    expect(screen.getByRole('status')).toHaveTextContent('10000');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 1250 bài tập');
    fireEvent.change(screen.getByLabelText('Nhóm cơ'), { target: { value: 'Vai' } });
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 250 bài tập');
  });

  it('tìm theo huấn luyện viên, hiện trạng thái rỗng và đặt lại bộ lọc', () => {
    vi.useFakeTimers();
    renderWithProviders(<LibraryPage />);
    const search = screen.getByRole('searchbox', { name: 'Tìm kiếm' });
    fireEvent.change(search, { target: { value: 'đức anh' } });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 1000 bài tập');
    fireEvent.change(search, { target: { value: 'xyz' } });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('heading', { name: 'Không tìm thấy bài tập nào' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Đặt lại bộ lọc' })[0]);
    act(() => vi.advanceTimersByTime(300));
    expect(search).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('10000');
  });

  it('sắp tên theo tiếng Việt và thời lượng tăng dần mà không sửa kho gốc', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryPage />);
    await user.selectOptions(screen.getByLabelText('Sắp xếp'), 'name');
    expect(within(screen.getAllByRole('row')[1]).getByText('Bật chậm 1')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Sắp xếp'), 'duration');
    expect(within(screen.getAllByRole('row')[1]).getByText('0:30')).toBeInTheDocument();
    expect(EXERCISES.slice(0, 3).map((exercise) => exercise.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('bắt đầu đúng bài trong danh sách đã lọc và sắp xếp', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryPage />);
    await user.selectOptions(screen.getByLabelText('Nhóm cơ'), 'Vai');
    await user.selectOptions(screen.getByLabelText('Sắp xếp'), 'name');
    const secondRow = screen.getAllByRole('row')[2];
    const selectedName = within(secondRow).getAllByRole('cell')[1].textContent;
    await user.click(within(secondRow).getByRole('button', { name: 'Bắt đầu' }));
    const state = useSessionStore.getState();
    expect(state.queue).toHaveLength(2000);
    expect(state.queue.every((exercise) => exercise.group === 'Vai')).toBe(true);
    expect(state.queue[state.currentIndex].name).toBe(selectedName);
    expect(state.currentIndex).toBe(1);
    expect(state.isRunning).toBe(true);
    expect(state.queue[0].name.localeCompare(state.queue[1].name, 'vi')).toBeLessThanOrEqual(0);
  });

  it('thêm bài đúng giáo án được chọn và không thêm trùng', async () => {
    const user = userEvent.setup();
    localStorage.setItem('workout-routines', JSON.stringify([
      { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      { id: 'r2', name: 'Ngày vai', exerciseIds: [] },
    ]));
    renderWithProviders(<LibraryPage />);
    await user.selectOptions(screen.getByLabelText('Giáo án đang chọn'), 'r2');
    const add = within(screen.getAllByRole('row')[1]).getByRole('button', { name: '+ Giáo án' });
    await user.click(add);
    await user.click(add);
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')).toEqual([
      { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      { id: 'r2', name: 'Ngày vai', exerciseIds: ['e1'] },
    ]);
  });

  it('danh sách không render lại theo mỗi tick của đồng hồ', () => {
    const onRender = vi.fn();
    renderWithProviders(<><Profiler id="library" onRender={onRender}><LibraryPage /></Profiler><SessionBar /></>);
    act(() => useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0));
    onRender.mockClear();
    act(() => useSessionStore.getState().tick());
    expect(screen.getByText('Còn lại:')).toHaveTextContent('Còn lại: 0:29');
    expect(onRender).not.toHaveBeenCalled();
  });
});
