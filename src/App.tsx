const BUILD_TAG = "wk-5182";

import { Link, NavLink, Route, Routes } from 'react-router-dom';
import LibraryPage from './features/library/LibraryPage';
import SavedPage from './features/saved/SavedPage';
import { SessionBar } from './features/session/SessionBar';

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
          <nav aria-label="Điều hướng chính">
            <NavLink to="/" end>Kho bài tập</NavLink>
            <NavLink to="/saved">Đã lưu</NavLink>
            <NavLink to="/routines">Giáo án</NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/routines" element={<ComingSoonPage title="Giáo án" description="Chức năng tạo và quản lý giáo án sẽ được hoàn thiện ở phần 3." />} />
          <Route path="/routines/:id" element={<ComingSoonPage title="Chi tiết giáo án" description="Nội dung giáo án sẽ được hoàn thiện ở phần 3." />} />
          <Route path="*" element={<ComingSoonPage title="Không tìm thấy trang" description="Đường dẫn này không tồn tại. Hãy quay lại kho bài tập để tiếp tục." />} />
        </Routes>
      </main>
      <footer className="site-footer">Bấm giờ tập luyện <span aria-hidden="true">·</span> Kiên trì từng giây, tiến bộ mỗi ngày.</footer>
      <SessionBar />
    </div>
  );
}
