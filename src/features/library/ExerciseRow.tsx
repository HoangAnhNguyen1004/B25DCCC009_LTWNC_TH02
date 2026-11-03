import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  style?: CSSProperties;
  onStart?: (exercise: Exercise) => void;
  onSave?: (exercise: Exercise) => void;
  onAddToSession?: (exercise: Exercise) => void;
}

export const ExerciseRow = memo(function ExerciseRow({
  exercise,
  index,
  style,
  onStart,
  onSave,
  onAddToSession,
}: ExerciseRowProps) {
  const handleStart = useCallback(() => onStart?.(exercise), [onStart, exercise]);
  const handleSave = useCallback(() => onSave?.(exercise), [onSave, exercise]);
  const handleAddToSession = useCallback(
    () => onAddToSession?.(exercise),
    [onAddToSession, exercise],
  );

  return (
    <div className="exercise-row exercise-grid" style={style} role="row" aria-rowindex={index + 2}>
      <span className="row-number" role="cell">{index + 1}</span>
      <span className="exercise-name" role="cell" title={exercise.name}>{exercise.name}</span>
      <span className="trainer-name" role="cell">{exercise.trainer}</span>
      <span role="cell"><span className="muscle-badge" data-group={exercise.group}>{exercise.group}</span></span>
      <span className="duration" role="cell">{formatDuration(exercise.duration)}</span>
      <div className="row-actions" role="cell">
        <button className="start-button" type="button" onClick={handleStart} disabled={!onStart} title={!onStart ? 'Có ở phần 2' : undefined}>Bắt đầu</button>
        <button className="save-button" type="button" onClick={handleSave} disabled={!onSave} aria-label="Lưu bài tập" title={!onSave ? 'Có ở phần 2' : 'Lưu bài tập'}>☆</button>
        <button className="queue-button" type="button" onClick={handleAddToSession} disabled={!onAddToSession} title={!onAddToSession ? 'Có ở phần 2' : undefined}>+ Buổi tập</button>
      </div>
    </div>
  );
});
