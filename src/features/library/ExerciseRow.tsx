import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';
import { useSavedStore } from '../saved/useSavedStore';
import { useSessionStore } from '../session/useSessionStore';

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  style?: CSSProperties;
  onStart?: (exercise: Exercise) => void;
  showRoutineAction?: boolean;
  onAddToRoutine?: (exercise: Exercise) => void;
}

export const ExerciseRow = memo(function ExerciseRow({
  exercise,
  index,
  style,
  onStart,
  showRoutineAction = false,
  onAddToRoutine,
}: ExerciseRowProps) {
  const isSaved = useSavedStore((state) => state.ids.includes(exercise.id));
  const toggleSaved = useSavedStore((state) => state.toggle);
  const addToSession = useSessionStore((state) => state.addToSession);
  const handleStart = useCallback(() => onStart?.(exercise), [onStart, exercise]);
  const handleSave = useCallback(() => toggleSaved(exercise.id), [toggleSaved, exercise.id]);
  const handleAddToSession = useCallback(
    () => addToSession(exercise),
    [addToSession, exercise],
  );
  const handleAddToRoutine = useCallback(() => onAddToRoutine?.(exercise), [onAddToRoutine, exercise]);

  return (
    <div className="exercise-row exercise-grid" style={style} role="row" aria-rowindex={index + 2}>
      <span className="row-number" role="cell">{index + 1}</span>
      <span className="exercise-name" role="cell" title={exercise.name}>{exercise.name}</span>
      <span className="trainer-name" role="cell">{exercise.trainer}</span>
      <span role="cell"><span className="muscle-badge" data-group={exercise.group}>{exercise.group}</span></span>
      <span className="duration" role="cell">{formatDuration(exercise.duration)}</span>
      <div className="row-actions" role="cell">
        <button className="start-button" type="button" onClick={handleStart} disabled={!onStart}>Bắt đầu</button>
        <button className="save-button" type="button" onClick={handleSave} aria-label={isSaved ? 'Bỏ lưu' : 'Lưu bài tập'} aria-pressed={isSaved} title={isSaved ? 'Bỏ lưu' : 'Lưu bài tập'}>{isSaved ? '★' : '☆'}</button>
        <button className="queue-button" type="button" onClick={handleAddToSession}>+ Buổi tập</button>
        {showRoutineAction && <button className="routine-button" type="button" onClick={handleAddToRoutine} disabled={!onAddToRoutine}>+ Giáo án</button>}
      </div>
    </div>
  );
});
