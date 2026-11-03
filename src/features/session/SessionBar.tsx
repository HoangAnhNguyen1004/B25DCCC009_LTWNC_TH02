import { useCallback, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useSessionShortcuts } from '../../hooks/useSessionShortcuts';
import { CountdownBar } from './CountdownBar';
import { useSessionStore } from './useSessionStore';

export function SessionBar() {
  const exercise = useSessionStore((state) => state.queue[state.currentIndex]);
  const queueLength = useSessionStore((state) => state.queue.length);
  const isRunning = useSessionStore((state) => state.isRunning);
  const toggleRun = useSessionStore((state) => state.toggleRun);
  const prev = useSessionStore((state) => state.prev);
  const next = useSessionStore((state) => state.next);
  const tick = useSessionStore((state) => state.tick);
  const isResting = useSessionStore((state) => state.restRemaining > 0);
  const restDuration = useSessionStore((state) => state.restDuration);
  const setRestDuration = useSessionStore((state) => state.setRestDuration);
  useSessionShortcuts();

  const handleRestChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setRestDuration(Number(event.target.value));
  }, [setRestDuration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return (
    <section className="session-bar" aria-label="Đồng hồ buổi tập">
      <div className="session-bar-inner">
        <div className="session-details">
          <p className="session-current">
            {exercise ? `${isResting ? 'Đang nghỉ sau' : 'Đang tập'}: ${exercise.name} – HLV ${exercise.trainer}` : 'Chưa bắt đầu buổi tập'}
          </p>
          <p className="session-queue">Buổi tập: {queueLength} bài</p>
        </div>
        <CountdownBar />
        <div className="session-controls-block">
          <div className="session-controls">
            <button type="button" onClick={prev} disabled={!exercise}>Trước</button>
            <button className="session-toggle" type="button" onClick={toggleRun} disabled={queueLength === 0} aria-keyshortcuts="Space" title="Phím tắt: Space">{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</button>
            <button type="button" onClick={next} disabled={!exercise}>Sau</button>
          </div>
          <label className="session-rest-setting" htmlFor="session-rest-duration">Nghỉ giữa bài
            <select id="session-rest-duration" value={restDuration} onChange={handleRestChange} disabled={isResting}>
              <option value={0}>Không nghỉ</option>
              <option value={10}>10 giây</option>
              <option value={20}>20 giây</option>
              <option value={30}>30 giây</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
