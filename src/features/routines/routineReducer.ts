import type { Routine } from '../../types';

export type RoutineAction =
  | { type: 'create'; routine: Routine }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'addExercise'; id: string; exerciseId: string }
  | { type: 'removeExercise'; id: string; exerciseId: string };

export function validateRoutineName(routines: Routine[], name: string, excludeId?: string): string | null {
  const normalizedName = name.trim().toLocaleLowerCase('vi');
  if (!normalizedName) return 'Tên giáo án không được để trống';
  if (routines.some((routine) => routine.id !== excludeId && routine.name.toLocaleLowerCase('vi') === normalizedName)) {
    return 'Tên giáo án đã tồn tại';
  }
  return null;
}

export function routineReducer(state: Routine[], action: RoutineAction): Routine[] {
  switch (action.type) {
    case 'create':
      if (state.some((routine) => routine.id === action.routine.id) || validateRoutineName(state, action.routine.name)) return state;
      return [...state, { ...action.routine, name: action.routine.name.trim(), exerciseIds: [...new Set(action.routine.exerciseIds)] }];
    case 'rename':
      if (validateRoutineName(state, action.name, action.id)) return state;
      return state.map((routine) => routine.id === action.id ? { ...routine, name: action.name.trim() } : routine);
    case 'remove':
      return state.filter((routine) => routine.id !== action.id);
    case 'addExercise':
      return state.map((routine) => routine.id === action.id && !routine.exerciseIds.includes(action.exerciseId)
        ? { ...routine, exerciseIds: [...routine.exerciseIds, action.exerciseId] }
        : routine);
    case 'removeExercise':
      return state.map((routine) => routine.id === action.id && routine.exerciseIds.includes(action.exerciseId)
        ? { ...routine, exerciseIds: routine.exerciseIds.filter((id) => id !== action.exerciseId) }
        : routine);
  }
}
