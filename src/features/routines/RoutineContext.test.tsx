import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetTestState, TestProviders } from '../../test-utils';
import { useRoutineDispatch, useRoutines } from './RoutineContext';

describe('RoutineContext', () => {
  beforeEach(resetTestState);

  it('báo lỗi rõ ràng khi dùng hook ngoài Provider', () => {
    expect(() => renderHook(() => useRoutines())).toThrow('useRoutines phải được dùng bên trong RoutineProvider');
    expect(() => renderHook(() => useRoutineDispatch())).toThrow('useRoutineDispatch phải được dùng bên trong RoutineProvider');
  });

  it('đọc giáo án đã lưu, cập nhật state và ghi lại localStorage', () => {
    const routine = { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] };
    localStorage.setItem('workout-routines', JSON.stringify([routine]));
    const { result } = renderHook(() => ({ routines: useRoutines(), dispatch: useRoutineDispatch() }), { wrapper: TestProviders });
    expect(result.current.routines).toEqual([routine]);
    act(() => { result.current.dispatch({ type: 'addExercise', id: 'r1', exerciseId: 'e2' }); });
    expect(result.current.routines[0].exerciseIds).toEqual(['e1', 'e2']);
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')).toEqual(result.current.routines);
  });

  it('component chỉ đọc dispatch không render lại và chặn trùng tên trong các action liên tiếp', () => {
    let renderCount = 0;
    const { result } = renderHook(() => { renderCount += 1; return useRoutineDispatch(); }, { wrapper: TestProviders });
    const dispatch = result.current;
    let duplicateError: string | null = null;
    act(() => {
      dispatch({ type: 'create', routine: { id: 'r1', name: 'Ngày ngực', exerciseIds: [] } });
      duplicateError = dispatch({ type: 'create', routine: { id: 'r2', name: 'ngày NGỰC', exerciseIds: [] } });
    });
    expect(duplicateError).toBe('Tên giáo án đã tồn tại');
    expect(renderCount).toBe(1);
    expect(result.current).toBe(dispatch);
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')).toHaveLength(1);
  });

  it.each(['không phải JSON', '{}', '[{"id":1}]'])('dữ liệu lưu không hợp lệ (%s) thì khởi tạo danh sách rỗng', (stored) => {
    localStorage.setItem('workout-routines', stored);
    const { result } = renderHook(() => useRoutines(), { wrapper: TestProviders });
    expect(result.current).toEqual([]);
  });
});
