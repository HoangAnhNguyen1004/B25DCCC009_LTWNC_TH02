import { useEffect } from 'react';
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
            {exercise ? `Đang tập: ${exercise.name} – HLV ${exercise.trainer}` : 'Chưa bắt đầu buổi tập'}
          </p>
          <p className="session-queue">Buổi tập: {queueLength} bài</p>
        </div>
        <CountdownBar />
        <div className="session-controls">
          <button type="button" onClick={prev} disabled={!exercise}>Trước</button>
          <button className="session-toggle" type="button" onClick={toggleRun} disabled={queueLength === 0}>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</button>
          <button type="button" onClick={next} disabled={!exercise}>Sau</button>
        </div>
      </div>
    </section>
  );
}
