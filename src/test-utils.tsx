import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { RoutineProvider } from './features/routines/RoutineContext';
import { useSavedStore } from './features/saved/useSavedStore';
import { useSessionStore } from './features/session/useSessionStore';

export function resetTestState() {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  useSavedStore.setState(useSavedStore.getInitialState(), true);
  localStorage.clear();
  delete document.documentElement.dataset.theme;
}

export function TestProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider><RoutineProvider>{children}</RoutineProvider></ThemeProvider>;
}

export function renderWithProviders(ui: ReactElement, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TestProviders>{ui}</TestProviders>
    </MemoryRouter>,
  );
}
