'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action?: () => void;
}

interface UseKeyboardShortcutsOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSearch?: () => void;
  onLogout?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onEscape, onEnter, onSearch, onLogout, enabled = true } = options;
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (event.key === 'Escape') {
          target.blur();
          onEscape?.();
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setShowHelp(false);
          onEscape?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case '/':
          event.preventDefault();
          onSearch?.();
          break;
        case 'l':
        case 'L':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onLogout?.();
          }
          break;
        case '?':
          event.preventDefault();
          setShowHelp((prev) => !prev);
          break;
      }
    },
    [enabled, onEscape, onEnter, onSearch, onLogout]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

// Keyboard Shortcuts Modal
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const shortcuts: Shortcut[] = [
    { key: 'Esc', description: 'Close modals / Clear focus' },
    { key: 'Enter', description: 'Submit form' },
    { key: '/', description: 'Focus search' },
    { key: 'Ctrl + L', description: 'Logout' },
    { key: '?', description: 'Show/hide shortcuts' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg text-white tracking-wider">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/60 text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/80 font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-white/30 text-xs">
              Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
