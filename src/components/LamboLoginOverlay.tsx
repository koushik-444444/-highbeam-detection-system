'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface LamboLoginOverlayProps {
  isVisible: boolean;
}

export default function LamboLoginOverlay({ isVisible }: LamboLoginOverlayProps) {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dob, setDob] = useState('');
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
        body: JSON.stringify({ vehicleNumber, dob }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.hasViolations) {
          setShowViolationWarning(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
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
  }, [vehicleNumber, dob, router]);

  return (
    <>
      {/* Violation Warning Flash */}
      <AnimatePresence>
        {showViolationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-red-500 flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-red-500 tracking-wider uppercase">
                Violation Detected
              </h2>
              <p className="text-white/60 text-sm mt-2">Redirecting to dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Overlay - Login on RIGHT side, car visible on LEFT/CENTER */}
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-10 pointer-events-none">
            {/* Top Header Bar */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto"
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 100 60" className="w-10 h-6 text-amber-500">
                  <path
                    fill="currentColor"
                    d="M50 5 L20 25 L5 20 L15 35 L10 55 L30 45 L50 55 L70 45 L90 55 L85 35 L95 20 L80 25 L50 5Z"
                  />
                </svg>
                <div>
                  <span className="text-white/90 text-sm tracking-[0.2em] font-light uppercase">
                    High Beam
                  </span>
                  <span className="text-amber-500/60 text-xs tracking-wider uppercase ml-2">
                    Detection
                  </span>
                </div>
              </div>

              {/* Admin Link */}
              <a
                href="/admin"
                className="text-white/40 hover:text-amber-500 text-xs tracking-wider uppercase transition-colors px-4 py-2"
              >
                Admin
              </a>
            </motion.header>

            {/* Login Panel - RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex items-center p-6 pointer-events-auto"
            >
              {/* Glass Panel */}
              <div className="w-full bg-black/60 backdrop-blur-xl border-l border-white/10 rounded-l-2xl overflow-hidden">
                {/* Accent line */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                
                <div className="p-8">
                  {/* Title */}
                  <div className="mb-8">
                    <h1 className="text-white/90 text-lg font-light tracking-[0.2em] uppercase">
                      Vehicle Access
                    </h1>
                    <p className="text-white/40 text-xs mt-1 tracking-wide">
                      Enter credentials to check violation status
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAuthenticate} className="space-y-5">
                    {/* Vehicle Number */}
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs tracking-wider uppercase block">
                        Vehicle Registration
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="MH 12 AB 1234"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 tracking-wider text-sm"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs tracking-wider uppercase block">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 text-sm"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                          <p className="text-red-400 text-sm text-center">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isAuthenticating || !vehicleNumber || !dob}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden text-sm"
                    >
                      <span className={isAuthenticating ? 'opacity-0' : 'opacity-100'}>
                        Authenticate
                      </span>
                      
                      {/* Loading spinner */}
                      {isAuthenticating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.button>
                  </form>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-white/30 text-xs text-center">
                      AI-Powered Detection System
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom info - LEFT SIDE (over the car area) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute bottom-6 left-6 pointer-events-none"
            >
              <p className="text-white/20 text-xs tracking-[0.15em] uppercase">
                Intelligent High Beam Detection
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
