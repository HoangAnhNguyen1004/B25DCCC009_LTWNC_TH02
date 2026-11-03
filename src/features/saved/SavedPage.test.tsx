import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { renderWithProviders, resetTestState } from '../../test-utils';
import { useSessionStore } from '../session/useSessionStore';
import SavedPage from './SavedPage';
import { useSavedStore } from './useSavedStore';

describe('SavedPage', () => {
  beforeEach(resetTestState);

  it('hiện trạng thái rỗng và khóa Tập tất cả khi chưa lưu bài', () => {
    renderWithProviders(<SavedPage />);
    expect(screen.getByRole('heading', { name: 'Bạn chưa lưu bài tập nào' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tập tất cả' })).toBeDisabled();
  });

  it('Tập tất cả bắt đầu đúng danh sách đã lưu, bấm từng bài bắt đầu đúng vị trí', async () => {
    const user = userEvent.setup();
    useSavedStore.setState({ ids: ['e1', 'e3'] });
    renderWithProviders(<SavedPage />);
    await user.click(screen.getByRole('button', { name: 'Tập tất cả' }));
    expect(useSessionStore.getState()).toMatchObject({ queue: [EXERCISES[0], EXERCISES[2]], currentIndex: 0, isRunning: true });
    await user.click(within(screen.getAllByRole('row')[2]).getByRole('button', { name: 'Bắt đầu' }));
    expect(useSessionStore.getState().currentIndex).toBe(1);
  });

  it('bỏ lưu bài cuối thì danh sách chuyển thành trạng thái rỗng', async () => {
    const user = userEvent.setup();
    useSavedStore.setState({ ids: ['e1'] });
    renderWithProviders(<SavedPage />);
    await user.click(screen.getByRole('button', { name: 'Bỏ lưu' }));
    expect(screen.getByRole('heading', { name: 'Bạn chưa lưu bài tập nào' })).toBeInTheDocument();
    expect(useSavedStore.getState().ids).toEqual([]);
  });
});
