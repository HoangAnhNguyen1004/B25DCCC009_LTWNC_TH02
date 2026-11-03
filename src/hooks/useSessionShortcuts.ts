import { useEffect } from 'react';
import { useSessionStore } from '../features/session/useSessionStore';

export function useSessionShortcuts() {
  const toggleRun = useSessionStore((state) => state.toggleRun);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.code !== 'Space' && event.key !== ' ') || event.repeat || event.defaultPrevented
        || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
      event.preventDefault();
      toggleRun();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRun]);
}
