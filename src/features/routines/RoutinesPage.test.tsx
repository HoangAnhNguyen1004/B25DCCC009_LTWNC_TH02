import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, resetTestState } from '../../test-utils';
import RoutinesPage from './RoutinesPage';

describe('RoutinesPage', () => {
  beforeEach(resetTestState);

  it('bấm Tạo khi ô trống thì báo lỗi tên giáo án', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');
    expect(screen.getByLabelText('Tên giáo án')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('list', { name: 'Danh sách giáo án' })).not.toBeInTheDocument();
  });

  it('nhập tên rồi bấm Tạo thì tên xuất hiện trong danh sách và được lưu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);
    await user.type(screen.getByLabelText('Tên giáo án'), '  Ngày ngực  ');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    const list = screen.getByRole('list', { name: 'Danh sách giáo án' });
    expect(within(list).getByRole('link', { name: 'Ngày ngực' })).toBeInTheDocument();
    expect(within(list).getByText('0 bài')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên giáo án')).toHaveValue('');
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')).toEqual([
      { id: expect.any(String), name: 'Ngày ngực', exerciseIds: [] },
    ]);
  });

  it('không tạo trùng tên không phân biệt hoa thường và xóa được giáo án', async () => {
    const user = userEvent.setup();
    localStorage.setItem('workout-routines', JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }]));
    renderWithProviders(<RoutinesPage />);
    await user.type(screen.getByLabelText('Tên giáo án'), 'ngày NGỰC');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Xóa giáo án Ngày ngực' }));
    expect(screen.getByRole('heading', { name: 'Bạn chưa có giáo án nào' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? 'null')).toEqual([]);
  });
});
