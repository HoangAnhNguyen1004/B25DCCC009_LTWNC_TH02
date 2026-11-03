import { Profiler, useCallback, useState } from 'react';
import type { ProfilerOnRenderCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import LibraryPage from '../src/features/library/LibraryPage';
import { RoutineProvider } from '../src/features/routines/RoutineContext';
import '../src/index.css';

interface Measurement {
  mode: string;
  actualDuration: number;
  baseDuration: number;
  rows: number;
}

function ProfileLibrary() {
  const [run, setRun] = useState<{ virtualized: boolean; id: number } | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const handleRender = useCallback<ProfilerOnRenderCallback>((id, phase, actualDuration, baseDuration) => {
    if (phase !== 'mount') return;
    const measurement = { mode: id, actualDuration, baseDuration, rows: document.querySelectorAll('.exercise-row').length };
    setMeasurements((previous) => [...previous, measurement]);
  }, []);

  return (
    <main className="main-content">
      <h1>Đo render kho 10.000 bài tập</h1>
      <p>React Profiler, lần mount mới, không StrictMode. actualDuration đo thời gian React render, không tính toàn bộ thời gian tải trang hoặc vẽ DOM.</p>
      <div className="routine-card-actions">
        <button type="button" className="primary-button" onClick={() => setRun((previous) => ({ virtualized: true, id: (previous?.id ?? 0) + 1 }))}>Đo có ảo hóa</button>
        <button type="button" className="secondary-button" onClick={() => setRun((previous) => ({ virtualized: false, id: (previous?.id ?? 0) + 1 }))}>Đo không ảo hóa</button>
      </div>
      <pre id="profile-results" aria-label="Kết quả đo">{JSON.stringify(measurements, null, 2)}</pre>
      {run && <Profiler key={run.id} id={run.virtualized ? 'virtualized' : 'full-list'} onRender={handleRender}>
        <LibraryPage virtualized={run.virtualized} />
      </Profiler>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider><RoutineProvider><ProfileLibrary /></RoutineProvider></ThemeProvider>
  </BrowserRouter>,
);
