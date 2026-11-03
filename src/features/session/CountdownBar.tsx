import { formatDuration } from '../../utils/format';
import { useSessionStore } from './useSessionStore';

export function CountdownBar() {
  const elapsed = useSessionStore((state) => state.elapsed);
  const duration = useSessionStore((state) => state.queue[state.currentIndex]?.duration ?? 0);
  const remaining = Math.max(0, duration - elapsed);
  const progress = duration === 0 ? 0 : Math.min(100, Math.round((elapsed / duration) * 100));

  return (
    <div className="countdown-bar">
      <div className="countdown-labels">
        <span>Còn lại: <strong>{formatDuration(remaining)}</strong></span>
        <span>{progress}%</span>
      </div>
      <div className="session-progress" role="progressbar" aria-label="Tiến trình bài tập" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="session-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
