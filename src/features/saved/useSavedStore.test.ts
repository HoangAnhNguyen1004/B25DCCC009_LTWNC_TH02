import { beforeEach, describe, expect, it } from 'vitest';
import { resetTestState } from '../../test-utils';
import { useSavedStore } from './useSavedStore';

describe('useSavedStore', () => {
  beforeEach(resetTestState);

  it('toggle lưu hoặc bỏ lưu mà không làm mất các bài khác', () => {
    const { toggle } = useSavedStore.getState();
    toggle('e1'); toggle('e3'); toggle('e1');
    expect(useSavedStore.getState().ids).toEqual(['e3']);
  });

  it('persist ID vào đúng key và khôi phục sau khi nạp lại storage', async () => {
    useSavedStore.getState().toggle('e1');
    useSavedStore.getState().toggle('e3');
    const stored = localStorage.getItem('workout-saved');
    expect(JSON.parse(stored ?? '{}')).toEqual({ state: { ids: ['e1', 'e3'] }, version: 0 });
    useSavedStore.setState({ ids: [] });
    localStorage.setItem('workout-saved', stored!);
    await useSavedStore.persist.rehydrate();
    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);
    expect(useSavedStore.getState().toggle).toBeTypeOf('function');
  });
});
