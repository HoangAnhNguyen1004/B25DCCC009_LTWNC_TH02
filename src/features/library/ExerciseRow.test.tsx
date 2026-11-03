import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { resetTestState } from '../../test-utils';
import { useSavedStore } from '../saved/useSavedStore';
import { useSessionStore } from '../session/useSessionStore';
import { ExerciseRow } from './ExerciseRow';

describe('ExerciseRow', () => {
  beforeEach(resetTestState);
  const exercise = EXERCISES[0];

  it('hiển thị tên, huấn luyện viên, nhóm cơ, số thứ tự và 0:30', () => {
    render(<ExerciseRow exercise={exercise} index={0} />);
    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('Ngực')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('bấm Bắt đầu gọi hàm mock với đúng bài tập', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<ExerciseRow exercise={exercise} index={0} onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(exercise);
  });

  it('đổi ngôi sao và nhãn khi lưu rồi bỏ lưu', async () => {
    const user = userEvent.setup();
    render(<ExerciseRow exercise={exercise} index={0} />);
    await user.click(screen.getByRole('button', { name: 'Lưu bài tập' }));
    expect(screen.getByRole('button', { name: 'Bỏ lưu' })).toHaveTextContent('★');
    expect(useSavedStore.getState().ids).toEqual(['e1']);
    await user.click(screen.getByRole('button', { name: 'Bỏ lưu' }));
    expect(screen.getByRole('button', { name: 'Lưu bài tập' })).toHaveTextContent('☆');
    expect(useSavedStore.getState().ids).toEqual([]);
  });

  it('thêm vào buổi tập và chỉ bật thêm giáo án khi có giáo án được chọn', async () => {
    const user = userEvent.setup();
    const onAddToRoutine = vi.fn();
    const { rerender } = render(<ExerciseRow exercise={exercise} index={0} showRoutineAction />);
    expect(screen.getByRole('button', { name: '+ Giáo án' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '+ Buổi tập' }));
    expect(useSessionStore.getState().queue).toEqual([exercise]);
    rerender(<ExerciseRow exercise={exercise} index={0} showRoutineAction onAddToRoutine={onAddToRoutine} />);
    await user.click(screen.getByRole('button', { name: '+ Giáo án' }));
    expect(onAddToRoutine).toHaveBeenCalledWith(exercise);
  });
});
