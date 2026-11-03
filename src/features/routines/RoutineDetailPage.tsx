import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EXERCISES } from '../../data/exercises';
import type { Exercise, Routine } from '../../types';
import { formatDuration } from '../../utils/format';
import { useSessionStore } from '../session/useSessionStore';
import { useRoutineDispatch, useRoutines } from './RoutineContext';

const exerciseById = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

function RenameRoutineForm({ routine }: { routine: Routine }) {
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState(routine.name);
  const [error, setError] = useState<string | null>(null);

  const handleRename = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = dispatch({ type: 'rename', id: routine.id, name });
    setError(validationError);
    if (!validationError) setName(name.trim());
  }, [dispatch, routine.id, name]);

  return (
    <form className="routine-form" onSubmit={handleRename} noValidate>
      <div className="field">
        <label htmlFor="rename-routine">Đổi tên giáo án</label>
        <input id="rename-routine" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={error !== null} aria-describedby={error ? 'rename-routine-error' : undefined} />
      </div>
      <button className="secondary-button" type="submit">Lưu tên</button>
      {error && <p className="form-error" id="rename-routine-error" role="alert">{error}</p>}
    </form>
  );
}

function RoutineExercise({ exercise, routineId }: { exercise: Exercise; routineId: string }) {
  const dispatch = useRoutineDispatch();
  const handleRemove = useCallback(() => {
    dispatch({ type: 'removeExercise', id: routineId, exerciseId: exercise.id });
  }, [dispatch, routineId, exercise.id]);

  return (
    <li className="routine-exercise">
      <div>
        <p className="routine-exercise-name">{exercise.name}</p>
        <p className="routine-exercise-meta">HLV {exercise.trainer} · {exercise.group} · {formatDuration(exercise.duration)}</p>
      </div>
      <button className="danger-button" type="button" onClick={handleRemove} aria-label={`Bỏ ${exercise.name}`}>Bỏ</button>
    </li>
  );
}

function RoutineDetail({ routine }: { routine: Routine }) {
  const startSession = useSessionStore((state) => state.startSession);
  const exercises = useMemo(() => routine.exerciseIds
    .map((id) => exerciseById.get(id))
    .filter((exercise): exercise is Exercise => exercise !== undefined), [routine.exerciseIds]);
  const totalSeconds = useMemo(() => exercises.reduce((total, exercise) => total + exercise.duration, 0), [exercises]);
  const handleStartAll = useCallback(() => startSession(exercises, 0), [startSession, exercises]);

  return (
    <>
      <section className="page-intro">
        <Link className="back-link" to="/routines">← Danh sách giáo án</Link>
        <h1>{routine.name}</h1>
        <p>{exercises.length} bài · Tổng thời gian: {Math.floor(totalSeconds / 60)} phút {totalSeconds % 60} giây</p>
      </section>
      <section className="library-panel" aria-label="Chi tiết giáo án">
        <RenameRoutineForm key={routine.id} routine={routine} />
        <div className="saved-toolbar">
          <Link className="secondary-button" to="/">Thêm bài từ kho</Link>
          <button className="primary-button" type="button" onClick={handleStartAll} disabled={exercises.length === 0}>Tập tất cả</button>
        </div>
        {exercises.length === 0 ? (
          <div className="empty-state">
            <h2>Giáo án chưa có bài tập</h2>
            <p>Chọn giáo án này ở kho bài tập rồi bấm + Giáo án để thêm bài.</p>
          </div>
        ) : (
          <ol className="routine-exercise-list" aria-label="Bài tập trong giáo án">
            {exercises.map((exercise) => <RoutineExercise key={exercise.id} exercise={exercise} routineId={routine.id} />)}
          </ol>
        )}
      </section>
    </>
  );
}

export default function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const routines = useRoutines();
  const routine = routines.find((item) => item.id === id);

  if (!routine) {
    return (
      <section className="placeholder-page">
        <h1>Không tìm thấy giáo án</h1>
        <p>Giáo án này không tồn tại hoặc đã được xóa.</p>
        <Link className="primary-button" to="/routines">Về danh sách giáo án</Link>
      </section>
    );
  }
  return <RoutineDetail key={routine.id} routine={routine} />;
}
