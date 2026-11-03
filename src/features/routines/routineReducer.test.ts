import { describe, expect, it } from 'vitest';
import type { Routine } from '../../types';
import { routineReducer } from './routineReducer';

describe('routineReducer', () => {
  const routine: Routine = { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] };

  it('tạo giáo án và không thay đổi state đầu vào', () => {
    const state: Routine[] = [];
    Object.freeze(state);
    expect(routineReducer(state, { type: 'create', routine })).toEqual([routine]);
    expect(state).toEqual([]);
  });

  it('thêm bài mới và không thêm trùng bài', () => {
    Object.freeze(routine.exerciseIds);
    Object.freeze(routine);
    const state = [routine];
    Object.freeze(state);
    const next = routineReducer(state, { type: 'addExercise', id: 'r1', exerciseId: 'e2' });
    expect(next[0].exerciseIds).toEqual(['e1', 'e2']);
    expect(routineReducer(next, { type: 'addExercise', id: 'r1', exerciseId: 'e1' })).toEqual(next);
    expect(state[0].exerciseIds).toEqual(['e1']);
  });

  it('bỏ bài khỏi giáo án mà không thay đổi giáo án cũ', () => {
    expect(routineReducer([routine], { type: 'removeExercise', id: 'r1', exerciseId: 'e1' })[0].exerciseIds).toEqual([]);
    expect(routine.exerciseIds).toEqual(['e1']);
  });

  it('đổi tên và xóa đúng giáo án được chọn', () => {
    const second: Routine = { id: 'r2', name: 'Ngày lưng', exerciseIds: [] };
    const renamed = routineReducer([routine, second], { type: 'rename', id: 'r1', name: '  Ngày ngực A  ' });
    expect(renamed[0].name).toBe('Ngày ngực A');
    expect(renamed[1]).toBe(second);
    expect(routineReducer(renamed, { type: 'remove', id: 'r1' })).toEqual([second]);
  });

  it('xóa giáo án không tồn tại thì nội dung state giữ nguyên', () => {
    const state = [routine];
    expect(routineReducer(state, { type: 'remove', id: 'khong-co' })).toEqual(state);
  });

  it('không tạo hoặc đổi thành tên trống, trùng tên hay trùng ID', () => {
    const state = [routine];
    expect(routineReducer(state, { type: 'create', routine: { ...routine, id: 'r2', name: 'ngày NGỰC' } })).toBe(state);
    expect(routineReducer(state, { type: 'create', routine: { ...routine, name: 'Tên khác' } })).toBe(state);
    expect(routineReducer(state, { type: 'rename', id: 'r1', name: ' ' })).toBe(state);
    expect(routineReducer(state, { type: 'create', routine: { ...routine, id: 'r2', name: ' ' } })).toBe(state);
  });
});
