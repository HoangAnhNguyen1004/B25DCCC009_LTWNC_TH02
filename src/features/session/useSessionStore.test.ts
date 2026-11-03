import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  const queue = EXERCISES.slice(0, 3);
  beforeEach(() => useSessionStore.setState({ queue: [], currentIndex: -1, elapsed: 0, isRunning: false, restDuration: 0, restRemaining: 0 }));

  it('bắt đầu đúng bài và đặt lại thời gian của buổi tập cũ', () => {
    useSessionStore.setState({ elapsed: 20 });
    useSessionStore.getState().startSession(queue, 1);
    expect(useSessionStore.getState()).toMatchObject({ queue, currentIndex: 1, elapsed: 0, isRunning: true });
    expect(useSessionStore.getState().queue).not.toBe(queue);
  });

  it('tick tăng một giây và ở giây cuối tự sang bài sau', () => {
    useSessionStore.getState().startSession(queue, 0);
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().elapsed).toBe(1);
    useSessionStore.setState({ elapsed: 29 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, isRunning: true });
  });

  it('next ở bài cuối thì dừng đồng hồ', () => {
    useSessionStore.getState().startSession(queue, 2);
    useSessionStore.getState().next();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 2, isRunning: false, elapsed: 104 });
  });

  it('hết thời gian bài cuối thì dừng và có thể tập lại bài cuối', () => {
    useSessionStore.getState().startSession(queue, 2);
    useSessionStore.setState({ elapsed: 103 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ elapsed: 104, isRunning: false });
    useSessionStore.getState().toggleRun();
    expect(useSessionStore.getState()).toMatchObject({ elapsed: 0, isRunning: true });
  });

  it('tạm dừng không tăng thời gian và tiếp tục từ thời điểm cũ', () => {
    useSessionStore.getState().startSession(queue, 0);
    useSessionStore.getState().tick();
    useSessionStore.getState().toggleRun();
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().elapsed).toBe(1);
    useSessionStore.getState().toggleRun();
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().elapsed).toBe(2);
  });

  it.each([[4, 1], [3, 0], [0, 0]])('Trước khi đã tập %i giây sẽ đặt lại bài ở vị trí %i', (elapsed, expectedIndex) => {
    useSessionStore.getState().startSession(queue, 1);
    useSessionStore.setState({ elapsed });
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: expectedIndex, elapsed: 0 });
  });

  it('Trước ở bài đầu chỉ đặt lại thời gian', () => {
    useSessionStore.getState().startSession(queue, 0);
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, elapsed: 0 });
  });

  it('thêm bài không trùng và bắt đầu được hàng đợi chưa chạy', () => {
    const store = useSessionStore.getState();
    store.addToSession(queue[0]);
    store.addToSession(queue[0]);
    store.addToSession(queue[1]);
    expect(useSessionStore.getState().queue).toEqual(queue.slice(0, 2));
    store.toggleRun();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, isRunning: true });
  });

  it('không chạy khi hàng đợi rỗng hoặc chưa chọn bài hợp lệ', () => {
    const store = useSessionStore.getState();
    store.toggleRun(); store.next(); store.prev(); store.tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: -1, elapsed: 0, isRunning: false });
    store.startSession(queue, 9);
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: -1, elapsed: 0, isRunning: false });
  });

  it('hết bài nghỉ đủ 10 giây rồi mới sang bài tiếp theo', () => {
    const store = useSessionStore.getState();
    store.setRestDuration(10);
    store.startSession(queue, 0);
    useSessionStore.setState({ elapsed: 29 });
    store.tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, elapsed: 30, restRemaining: 10, isRunning: true });
    for (let i = 0; i < 9; i += 1) store.tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, restRemaining: 1 });
    store.tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, restRemaining: 0, isRunning: true });
  });

  it('tạm dừng trong lúc nghỉ giữ nguyên đếm nghỉ và tiếp tục đúng thời điểm', () => {
    const store = useSessionStore.getState();
    store.setRestDuration(10);
    store.startSession(queue, 0);
    useSessionStore.setState({ elapsed: 29 });
    store.tick(); store.tick(); store.toggleRun(); store.tick();
    expect(useSessionStore.getState()).toMatchObject({ elapsed: 30, restRemaining: 9, isRunning: false });
    store.toggleRun(); store.tick();
    expect(useSessionStore.getState()).toMatchObject({ elapsed: 30, restRemaining: 8, isRunning: true });
  });

  it('bấm Sau bỏ qua nghỉ, Trước tập lại bài vừa xong và bắt đầu buổi mới xóa nghỉ cũ', () => {
    const store = useSessionStore.getState();
    store.setRestDuration(10);
    store.startSession(queue, 0);
    useSessionStore.setState({ elapsed: 30, restRemaining: 10 });
    store.next();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, restRemaining: 0 });
    useSessionStore.setState({ elapsed: 67, restRemaining: 10 });
    store.prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, restRemaining: 0 });
    useSessionStore.setState({ elapsed: 67, restRemaining: 10 });
    store.startSession(queue, 2);
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 2, elapsed: 0, restRemaining: 0 });
  });

  it('không nghỉ sau bài cuối và chỉ cho đổi thời gian nghỉ khi chưa nghỉ', () => {
    const store = useSessionStore.getState();
    store.setRestDuration(10);
    store.startSession(queue, 2);
    useSessionStore.setState({ elapsed: 103 });
    store.tick();
    expect(useSessionStore.getState()).toMatchObject({ restRemaining: 0, isRunning: false });
    store.setRestDuration(-1);
    store.setRestDuration(Number.NaN);
    expect(useSessionStore.getState().restDuration).toBe(10);
    useSessionStore.setState({ restRemaining: 5 });
    store.setRestDuration(20);
    expect(useSessionStore.getState().restDuration).toBe(10);
  });
});
