import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useRoutineDispatch, useRoutines } from './RoutineContext';
import type { Routine } from '../../types';

function CreateRoutineForm() {
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Tên giáo án không được để trống');
      return;
    }
    const validationError = dispatch({
      type: 'create',
      routine: { id: crypto.randomUUID(), name, exerciseIds: [] },
    });
    setError(validationError);
    if (!validationError) setName('');
  }, [dispatch, name]);

  return (
    <form className="routine-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="routine-name">Tên giáo án</label>
        <input id="routine-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Ngày ngực" aria-invalid={error !== null} aria-describedby={error ? 'create-routine-error' : undefined} />
      </div>
      <button className="primary-button" type="submit">Tạo</button>
      {error && <p className="form-error" id="create-routine-error" role="alert">{error}</p>}
    </form>
  );
}

function RoutineCard({ routine }: { routine: Routine }) {
  const dispatch = useRoutineDispatch();
  const handleRemove = useCallback(() => dispatch({ type: 'remove', id: routine.id }), [dispatch, routine.id]);

  return (
    <li className="routine-card">
      <div>
        <Link className="routine-name" to={`/routines/${routine.id}`}>{routine.name}</Link>
        <p>{routine.exerciseIds.length} bài</p>
      </div>
      <div className="routine-card-actions">
        <Link className="secondary-button" to={`/routines/${routine.id}`}>Chi tiết</Link>
        <button className="danger-button" type="button" onClick={handleRemove} aria-label={`Xóa giáo án ${routine.name}`}>Xóa</button>
      </div>
    </li>
  );
}

function RoutineList() {
  const routines = useRoutines();
  return routines.length === 0 ? (
    <div className="empty-state">
      <h2>Bạn chưa có giáo án nào</h2>
      <p>Tạo giáo án rồi chọn bài từ kho để sắp xếp buổi tập của bạn.</p>
    </div>
  ) : (
    <ul className="routine-list" aria-label="Danh sách giáo án">
      {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
    </ul>
  );
}

export default function RoutinesPage() {
  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">LÊN KẾ HOẠCH, GIỮ NHỊP TẬP LUYỆN</p>
        <h1>Giáo án</h1>
        <p>Tạo danh sách bài tập cho từng ngày, từng mục tiêu của bạn.</p>
      </section>
      <section className="library-panel" aria-label="Quản lý giáo án">
        <CreateRoutineForm />
        <RoutineList />
      </section>
    </>
  );
}
