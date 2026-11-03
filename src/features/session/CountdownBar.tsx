import { formatDuration } from '../../utils/format';
import { useSessionStore } from './useSessionStore';

export function CountdownBar() {
  const elapsed = useSessionStore((state) => state.elapsed);
  const duration = useSessionStore((state) => state.queue[state.currentIndex]?.duration ?? 0);
  const restRemaining = useSessionStore((state) => state.restRemaining);
  const restDuration = useSessionStore((state) => state.restDuration);
  const isResting = restRemaining > 0;
  const remaining = isResting ? restRemaining : Math.max(0, duration - elapsed);
  const progress = isResting
    ? Math.round(((restDuration - restRemaining) / restDuration) * 100)
    : duration === 0 ? 0 : Math.min(100, Math.round((elapsed / duration) * 100));

  return (
    <div className="countdown-bar">
      <div className="countdown-labels">
        <span>{isResting ? 'Nghỉ còn lại:' : 'Còn lại:'} <strong>{formatDuration(remaining)}</strong></span>
        <span>{progress}%</span>
      </div>
      <div className="session-progress" role="progressbar" aria-label={isResting ? 'Tiến trình nghỉ' : 'Tiến trình bài tập'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="session-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
