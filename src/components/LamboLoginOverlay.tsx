'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface LamboLoginOverlayProps {
  isVisible: boolean;
}

export default function LamboLoginOverlay({ isVisible }: LamboLoginOverlayProps) {
  const router = useRouter();
  const [driverId, setDriverId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [showViolationWarning, setShowViolationWarning] = useState(false);

  const handleAuthenticate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vehicleNumber: driverId, 
          dob: accessCode 
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.hasViolations) {
          setShowViolationWarning(true);
          await new Promise(resolve => setTimeout(resolve, 1800));
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Authentication failed');
        setIsAuthenticating(false);
      }
    } catch {
      setError('Connection error');
      setIsAuthenticating(false);
    }
  }, [driverId, accessCode, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && driverId && accessCode) {
      handleAuthenticate(e as unknown as React.FormEvent);
    }
  }, [driverId, accessCode, handleAuthenticate]);

  return (
    <>
      {/* Violation Warning Flash */}
      <AnimatePresence>
        {showViolationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, times: [0, 0.2, 0.4, 0.6, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(180, 40, 40, 0.15)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-red-400/60 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400/80 text-xs tracking-[0.3em] uppercase">
                Violation Detected
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="fixed inset-0 z-10 flex flex-col"
          >
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between p-6 md:p-8"
            >
              {/* Logo / Brand */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative">
                  {/* Stylized high beam icon */}
                  <svg viewBox="0 0 32 32" className="w-full h-full text-white/80">
                    <path 
                      fill="currentColor" 
                      d="M16 6L4 16l12 10V6zm0 0v20l12-10L16 6z" 
                      opacity="0.6"
                    />
                    <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.9"/>
                  </svg>
                </div>
                <div>
                  <span className="text-white/90 text-sm tracking-[0.2em] font-light uppercase">
                    High Beam
                  </span>
                </div>
              </div>

              {/* Admin Link */}
              <a
                href="/admin"
                className="text-white/40 hover:text-white/70 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
              >
                Admin
              </a>
            </motion.header>

            {/* Main Content - Centered slightly below middle (automotive standard) */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full max-w-xs"
              >
                {/* Title */}
                <div className="text-center mb-10">
                  <h1 className="text-white/90 text-xs tracking-[0.4em] font-light uppercase mb-2">
                    High Beam Control
                  </h1>
                  <div className="w-8 h-px bg-white/20 mx-auto" />
                </div>

                {/* Form */}
                <form onSubmit={handleAuthenticate} className="space-y-6">
                  {/* Driver ID Input */}
                  <div className="space-y-2">
                    <label className="hmi-label text-white/40 block">
                      Driver ID
                    </label>
                    <input
                      type="text"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value.toUpperCase())}
                      onKeyDown={handleKeyDown}
                      placeholder="MH 12 AB 1234"
                      className="w-full px-4 py-3 input-automotive rounded-sm text-sm tracking-wide"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>

                  {/* Access Code Input */}
                  <div className="space-y-2">
                    <label className="hmi-label text-white/40 block">
                      Access Code
                    </label>
                    <input
                      type="date"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-3 input-automotive rounded-sm text-sm tracking-wide"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-red-400/70 text-xs text-center tracking-wide py-2">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isAuthenticating || !driverId || !accessCode}
                    className="w-full py-3.5 mt-4 btn-automotive rounded-sm text-xs tracking-[0.25em] uppercase font-medium disabled:opacity-30 disabled:cursor-not-allowed relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className={isAuthenticating ? 'opacity-0' : 'opacity-100'}>
                      Authenticate
                    </span>
                    
                    {/* Loading indicator */}
                    {isAuthenticating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.button>
                </form>

                {/* Footer hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-white/20 text-xs mt-8 tracking-wide"
                >
                  Enter vehicle registration & date of birth
                </motion.p>
              </motion.div>
            </main>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 text-center"
            >
              <p className="text-white/20 text-xs tracking-[0.1em]">
                AI Detection System
              </p>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
