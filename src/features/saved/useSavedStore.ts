import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SavedState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useSavedStore = create<SavedState>()(
  devtools(persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((state) => ({
        ids: state.ids.includes(id)
          ? state.ids.filter((savedId) => savedId !== id)
          : [...state.ids, id],
      }), false, 'saved/toggle'),
    }),
    {
      name: 'workout-saved',
      partialize: (state) => ({ ids: state.ids }),
    },
  ), { name: 'Workout saved', enabled: import.meta.env.DEV }),
);
