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
                className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-red-500 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold text-red-500 tracking-wider uppercase">
                Violation Detected
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Overlay - CENTERED, COMPACT */}
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            {/* Compact Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full max-w-[280px]"
            >
              {/* Glass Card - Semi-transparent to see car behind */}
              <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                {/* Top accent line - cool blue/white to match headlights */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                
                <div className="p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    {/* Minimal icon */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full border border-white/20"
                    >
                      <svg className="w-5 h-5 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </motion.div>
                    
                    <motion.h1
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-white/90 text-sm font-light tracking-[0.2em] uppercase"
                    >
                      High Beam
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="text-white/40 text-[10px] tracking-[0.15em] uppercase mt-1"
                    >
                      Detection System
                    </motion.p>
                  </div>

                  {/* Form */}
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onSubmit={handleAuthenticate}
                    className="space-y-4"
                  >
                    {/* Vehicle Number */}
                    <div className="space-y-1.5">
                      <label className="text-white/40 text-[10px] tracking-wider uppercase block">
                        Vehicle No.
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="MH 12 AB 1234"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/25 focus:border-cyan-500/40 focus:bg-white/10 transition-all duration-300 tracking-wide"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="text-white/40 text-[10px] tracking-wider uppercase block">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/40 focus:bg-white/10 transition-all duration-300"
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
                          <p className="text-red-400/80 text-xs text-center py-1">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button - Cool cyan/white gradient matching headlights */}
                    <motion.button
                      type="submit"
                      disabled={isAuthenticating || !vehicleNumber || !dob}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 mt-1 bg-gradient-to-r from-cyan-600/90 to-cyan-400/90 hover:from-cyan-500 hover:to-cyan-300 text-black font-medium tracking-wider uppercase rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden text-xs"
                    >
                      <span className={isAuthenticating ? 'opacity-0' : 'opacity-100'}>
                        Authenticate
                      </span>
                      
                      {isAuthenticating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.button>
                  </motion.form>

                  {/* Admin Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-5 pt-4 border-t border-white/5 text-center"
                  >
                    <a
                      href="/admin"
                      className="text-white/30 hover:text-cyan-400/70 text-[10px] tracking-wider uppercase transition-colors"
                    >
                      Admin Portal
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
