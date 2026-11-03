import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISES } from '../../data/exercises';
import type { Exercise } from '../../types';
import { ExerciseRow } from '../library/ExerciseRow';
import { useSessionStore } from '../session/useSessionStore';
import { useSavedStore } from './useSavedStore';

export default function SavedPage() {
  const ids = useSavedStore((state) => state.ids);
  const startSession = useSessionStore((state) => state.startSession);
  const exercises = useMemo(() => {
    const savedIds = new Set(ids);
    return EXERCISES.filter((exercise) => savedIds.has(exercise.id));
  }, [ids]);

  const handleStart = useCallback((exercise: Exercise) => {
    startSession(exercises, exercises.findIndex((item) => item.id === exercise.id));
  }, [exercises, startSession]);

  const handleStartAll = useCallback(() => {
    startSession(exercises, 0);
  }, [exercises, startSession]);

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">DÀNH RIÊNG CHO BẠN</p>
        <h1>Bài tập đã lưu</h1>
        <p>Giữ lại những bài yêu thích, sẵn sàng cho buổi tập tiếp theo.</p>
      </section>
      <section className="library-panel" aria-label="Bài tập đã lưu">
        <div className="saved-toolbar">
          <p>Đã lưu <strong>{exercises.length}</strong> bài tập</p>
          <button className="primary-button" type="button" onClick={handleStartAll} disabled={exercises.length === 0}>Tập tất cả</button>
        </div>
        {exercises.length === 0 ? (
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">☆</span>
            <h2>Bạn chưa lưu bài tập nào</h2>
            <p>Bấm ngôi sao bên cạnh bài tập để thêm vào danh sách của bạn.</p>
            <Link className="primary-button" to="/">Khám phá kho bài tập</Link>
          </div>
        ) : (
          <div className="table-scroll">
            <div className="exercise-table" role="table" aria-label="Danh sách bài tập đã lưu" aria-rowcount={exercises.length + 1} aria-colcount={6}>
              <div className="table-heading exercise-grid" role="row">
                <span role="columnheader">STT</span>
                <span role="columnheader">Bài tập</span>
                <span role="columnheader">Huấn luyện viên</span>
                <span role="columnheader">Nhóm cơ</span>
                <span role="columnheader">Thời lượng</span>
                <span className="actions-heading" role="columnheader">Thao tác</span>
              </div>
              {exercises.map((exercise, index) => (
                <ExerciseRow key={exercise.id} exercise={exercise} index={index} onStart={handleStart} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
