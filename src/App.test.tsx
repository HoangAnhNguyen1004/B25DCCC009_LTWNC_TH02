import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders, resetTestState } from './test-utils';

describe('Điều hướng ứng dụng', () => {
  beforeEach(resetTestState);

  it.each([
    ['/saved', 'Bài tập đã lưu'],
    ['/routines', 'Giáo án'],
    ['/routines/r1', 'Ngày ngực'],
  ])('mở trực tiếp route lazy %s và vẫn hiện thanh đồng hồ', async (route, heading) => {
    localStorage.setItem('workout-routines', JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }]));
    renderWithProviders(<App />, route);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Đồng hồ buổi tập' })).toBeInTheDocument();
  });

  it('tô sáng menu theo trang và đổi được giao diện từ thanh menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const nav = within(screen.getByRole('navigation', { name: 'Điều hướng chính' }));
    expect(nav.getByRole('link', { name: 'Kho bài tập' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Giao diện tối' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(nav.getByRole('link', { name: 'Đã lưu' }));
    expect(await screen.findByRole('heading', { name: 'Bài tập đã lưu' })).toBeInTheDocument();
    expect(nav.getByRole('link', { name: 'Đã lưu' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Kho bài tập' })).not.toHaveAttribute('aria-current');
    await user.click(screen.getByRole('button', { name: 'Giao diện sáng' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('đường dẫn không tồn tại có link quay về kho bài tập', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, '/khong-ton-tai');
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Khám phá kho bài tập' }));
    expect(await screen.findByRole('heading', { name: 'Kho bài tập' })).toBeInTheDocument();
  });
});
