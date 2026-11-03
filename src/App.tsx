const BUILD_TAG = "wk-5182";

import { lazy, Suspense } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import LibraryPage from './features/library/LibraryPage';
import { SessionBar } from './features/session/SessionBar';
import { useTheme } from './contexts/ThemeContext';

const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}</button>;
}

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">BẤM GIỜ TẬP LUYỆN</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="primary-button" to="/">Khám phá kho bài tập</Link>
    </section>
  );
}

export default function App() {
  return (
    <div className="app" data-build={BUILD_TAG}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="Bấm giờ tập luyện, trang chủ">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3h6M12 3v3M17 7l2-2" /><circle cx="12" cy="14" r="7.5" /><path d="M12 10v4l2.5 1.5" /></svg>
            </span>
            <span>Bấm giờ <span className="brand-light">tập luyện</span></span>
          </Link>
          <div className="header-actions">
            <nav aria-label="Điều hướng chính">
              <NavLink to="/" end>Kho bài tập</NavLink>
              <NavLink to="/saved">Đã lưu</NavLink>
              <NavLink to="/routines">Giáo án</NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="main-content">
        <Suspense fallback={<p role="status">Đang tải trang...</p>}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
            <Route path="*" element={<ComingSoonPage title="Không tìm thấy trang" description="Đường dẫn này không tồn tại. Hãy quay lại kho bài tập để tiếp tục." />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="site-footer">Bấm giờ tập luyện <span aria-hidden="true">·</span> Kiên trì từng giây, tiến bộ mỗi ngày.</footer>
      <SessionBar />
    </div>
  );
}
