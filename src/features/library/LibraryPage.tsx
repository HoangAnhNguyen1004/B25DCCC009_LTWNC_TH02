import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FixedSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { EXERCISES, GROUPS } from '../../data/exercises';
import { useDebounce } from '../../hooks/useDebounce';
import type { Exercise, MuscleGroup } from '../../types';
import { ExerciseRow } from './ExerciseRow';

type SortOrder = 'default' | 'name' | 'duration';

interface ExerciseListData {
  exercises: Exercise[];
}

function exerciseKey(index: number, data: ExerciseListData): string {
  return data.exercises[index].id;
}

const VirtualizedRow = memo(function VirtualizedRow({
  index,
  style,
  data,
}: ListChildComponentProps<ExerciseListData>) {
  return <ExerciseRow exercise={data.exercises[index]} index={index} style={style} />;
});

const ExerciseList = memo(function ExerciseList({ exercises }: ExerciseListData) {
  const listRef = useRef<FixedSizeList<ExerciseListData>>(null);
  const itemData = useMemo(() => ({ exercises }), [exercises]);

  useLayoutEffect(() => {
    listRef.current?.scrollTo(0);
  }, [exercises]);

  return (
    <div className="table-scroll">
      <div className="exercise-table" role="table" aria-label="Danh sách bài tập" aria-rowcount={exercises.length + 1} aria-colcount={6}>
        <div className="table-heading exercise-grid" role="row">
          <span role="columnheader">STT</span>
          <span role="columnheader">Bài tập</span>
          <span role="columnheader">Huấn luyện viên</span>
          <span role="columnheader">Nhóm cơ</span>
          <span role="columnheader">Thời lượng</span>
          <span className="actions-heading" role="columnheader">Thao tác</span>
        </div>
        <FixedSizeList<ExerciseListData>
          ref={listRef}
          height={560}
          itemSize={56}
          width="100%"
          itemCount={exercises.length}
          itemData={itemData}
          itemKey={exerciseKey}
          overscanCount={2}
          className="virtual-list"
        >
          {VirtualizedRow}
        </FixedSizeList>
      </div>
    </div>
  );
});

export default function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<MuscleGroup | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const debouncedKeyword = useDebounce(keyword, 300);

  const exercises = useMemo(() => {
    const search = debouncedKeyword.trim().toLocaleLowerCase('vi');
    const result = EXERCISES.filter((exercise) => {
      const matchesKeyword = exercise.name.toLocaleLowerCase('vi').includes(search)
        || exercise.trainer.toLocaleLowerCase('vi').includes(search);
      return matchesKeyword && (group === '' || exercise.group === group);
    });

    if (sortOrder === 'name') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    if (sortOrder === 'duration') {
      return [...result].sort((a, b) => a.duration - b.duration);
    }
    return result;
  }, [debouncedKeyword, group, sortOrder]);

  const handleKeywordShift = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  const handleGroupChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setGroup(event.target.value as MuscleGroup | '');
  }, []);

  const handleSortChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder);
  }, []);

  const handleReset = useCallback(() => {
    setKeyword('');
    setGroup('');
    setSortOrder('default');
  }, []);

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">MỖI NGÀY MỘT CHÚT TIẾN BỘ</p>
        <h1>Kho bài tập</h1>
        <p>Tìm bài tập phù hợp, bắt đầu một buổi tập của riêng bạn.</p>
        <span className="catalog-badge">10.000 bài tập · 5 nhóm cơ</span>
      </section>

      <section className="library-panel" aria-label="Kho bài tập">
        <div className="filters">
          <div className="field search-field">
            <label htmlFor="keyword">Tìm kiếm</label>
            <div className="search-input">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              <input id="keyword" type="search" value={keyword} onChange={handleKeywordShift} placeholder="Tên bài tập hoặc huấn luyện viên…" autoComplete="off" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="muscle-group">Nhóm cơ</label>
            <select id="muscle-group" value={group} onChange={handleGroupChange}>
              <option value="">Tất cả</option>
              {GROUPS.map((muscleGroup) => <option key={muscleGroup} value={muscleGroup}>{muscleGroup}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort-order">Sắp xếp</label>
            <select id="sort-order" value={sortOrder} onChange={handleSortChange}>
              <option value="default">Mặc định</option>
              <option value="name">Tên A–Z</option>
              <option value="duration">Thời lượng tăng dần</option>
            </select>
          </div>
        </div>

        <div className="results-toolbar">
          <p role="status" aria-live="polite">Tìm thấy <strong>{exercises.length}</strong> bài tập</p>
          {(keyword !== '' || group !== '' || sortOrder !== 'default') && (
            <button className="reset-button" type="button" onClick={handleReset}>Đặt lại bộ lọc</button>
          )}
        </div>

        {exercises.length > 0 ? <ExerciseList exercises={exercises} /> : (
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">⌕</span>
            <h2>Không tìm thấy bài tập nào</h2>
            <p>Thử một từ khóa khác hoặc chọn lại nhóm cơ.</p>
            <button className="primary-button" type="button" onClick={handleReset}>Đặt lại bộ lọc</button>
          </div>
        )}
      </section>
      <p className="library-note">Thời lượng mỗi bài từ 30 đến 120 giây. Các thao tác buổi tập và lưu bài được bổ sung ở phần 2.</p>
    </>
  );
}
