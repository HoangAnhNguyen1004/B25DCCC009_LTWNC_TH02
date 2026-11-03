import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { renderWithProviders, resetTestState } from '../../test-utils';
import { useSessionStore } from '../session/useSessionStore';
import RoutineDetailPage from './RoutineDetailPage';

function openDetail() {
  return renderWithProviders(<Routes><Route path="/routines/:id" element={<RoutineDetailPage />} /></Routes>, '/routines/r1');
}

describe('RoutineDetailPage', () => {
  beforeEach(resetTestState);

  it('không tìm thấy giáo án thì báo rõ và có link quay lại', () => {
    openDetail();
    expect(screen.getByRole('heading', { name: 'Không tìm thấy giáo án' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về danh sách giáo án' })).toHaveAttribute('href', '/routines');
  });

  it('tính tổng 1 phút 37 giây, bắt đầu đúng giáo án và cập nhật tổng khi bỏ bài', async () => {
    const user = userEvent.setup();
    localStorage.setItem('workout-routines', JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] }]));
    openDetail();
    expect(screen.getByText('2 bài · Tổng thời gian: 1 phút 37 giây')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tập tất cả' }));
    expect(useSessionStore.getState()).toMatchObject({ queue: EXERCISES.slice(0, 2), currentIndex: 0, isRunning: true });
    await user.click(screen.getByRole('button', { name: 'Bỏ Đẩy tạ đơn 1' }));
    expect(screen.getByText('1 bài · Tổng thời gian: 1 phút 7 giây')).toBeInTheDocument();
    expect(screen.queryByText('Đẩy tạ đơn 1')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bỏ Kéo tạ đơn 1' }));
    expect(screen.getByRole('heading', { name: 'Giáo án chưa có bài tập' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tập tất cả' })).toBeDisabled();
    expect(useSessionStore.getState().queue).toHaveLength(2);
  });

  it('đổi tên hợp lệ và từ chối tên trống hoặc trùng giáo án khác', async () => {
    const user = userEvent.setup();
    localStorage.setItem('workout-routines', JSON.stringify([
      { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      { id: 'r2', name: 'Ngày lưng', exerciseIds: [] },
    ]));
    openDetail();
    const input = screen.getByLabelText('Đổi tên giáo án');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: 'Lưu tên' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');
    await user.type(input, 'ngày LƯNG');
    await user.click(screen.getByRole('button', { name: 'Lưu tên' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    await user.clear(input);
    await user.type(input, ' Ngày ngực A ');
    await user.click(screen.getByRole('button', { name: 'Lưu tên' }));
    expect(screen.getByRole('heading', { name: 'Ngày ngực A' })).toBeInTheDocument();
    expect(input).toHaveValue('Ngày ngực A');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
