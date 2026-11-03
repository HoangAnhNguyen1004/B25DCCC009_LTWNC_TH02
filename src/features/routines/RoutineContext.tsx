import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Routine } from '../../types';
import { routineReducer, validateRoutineName } from './routineReducer';
import type { RoutineAction } from './routineReducer';
import { withLogger } from './withLogger';

// Trả lỗi xác thực để form chỉ cần đọc DispatchContext, không phải theo dõi danh sách.
type RoutineDispatch = (action: RoutineAction) => string | null;

export const RoutineStateContext = createContext<Routine[] | undefined>(undefined);
export const RoutineDispatchContext = createContext<RoutineDispatch | undefined>(undefined);

function isRoutine(value: unknown): value is Routine {
  if (typeof value !== 'object' || value === null) return false;
  return 'id' in value && typeof value.id === 'string'
    && 'name' in value && typeof value.name === 'string' && value.name.trim() !== ''
    && 'exerciseIds' in value && Array.isArray(value.exerciseIds)
    && value.exerciseIds.every((id: unknown) => typeof id === 'string');
}

function loadRoutines(): Routine[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('workout-routines') ?? '[]');
    if (!Array.isArray(stored) || !stored.every(isRoutine)) return [];
    return stored;
  } catch {
    return [];
  }
}

const loggedReducer = withLogger(routineReducer);

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, baseDispatch] = useReducer(loggedReducer, undefined, loadRoutines);
  const currentRoutines = useRef(routines);

  const dispatch = useCallback<RoutineDispatch>((action) => {
    const state = currentRoutines.current;
    if (action.type === 'create' || action.type === 'rename') {
      const error = action.type === 'create'
        ? validateRoutineName(state, action.routine.name)
        : validateRoutineName(state, action.name, action.id);
      if (error) return error;
    }
    currentRoutines.current = routineReducer(state, action);
    baseDispatch(action);
    return null;
  }, []);

  useEffect(() => {
    localStorage.setItem('workout-routines', JSON.stringify(routines));
  }, [routines]);

  return (
    <RoutineDispatchContext.Provider value={dispatch}>
      <RoutineStateContext.Provider value={routines}>{children}</RoutineStateContext.Provider>
    </RoutineDispatchContext.Provider>
  );
}

export function useRoutines(): Routine[] {
  const routines = useContext(RoutineStateContext);
  if (routines === undefined) throw new Error('useRoutines phải được dùng bên trong RoutineProvider');
  return routines;
}

export function useRoutineDispatch(): RoutineDispatch {
  const dispatch = useContext(RoutineDispatchContext);
  if (dispatch === undefined) throw new Error('useRoutineDispatch phải được dùng bên trong RoutineProvider');
  return dispatch;
}
