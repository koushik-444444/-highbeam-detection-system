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

      {/* Main Login Overlay */}
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-full max-w-sm"
            >
              {/* Glass Card */}
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    {/* Lamborghini-inspired logo */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="inline-flex items-center justify-center w-16 h-16 mb-4"
                    >
                      <svg viewBox="0 0 100 60" className="w-full h-full text-amber-500">
                        <path
                          fill="currentColor"
                          d="M50 5 L20 25 L5 20 L15 35 L10 55 L30 45 L50 55 L70 45 L90 55 L85 35 L95 20 L80 25 L50 5Z"
                        />
                      </svg>
                    </motion.div>
                    
                    <motion.h1
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-xl font-light tracking-[0.3em] text-white uppercase"
                    >
                      High Beam
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="text-amber-500/80 text-xs tracking-[0.2em] uppercase mt-1"
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
                    className="space-y-5"
                  >
                    {/* Vehicle Number */}
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs tracking-wider uppercase block">
                        Vehicle Registration
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                          placeholder="MH 12 AB 1234"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 tracking-wider"
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="text-white/50 text-xs tracking-wider uppercase block">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
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
                      className="w-full py-4 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      <span className={isAuthenticating ? 'opacity-0' : 'opacity-100'}>
                        Authenticate
                      </span>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      
                      {/* Loading spinner */}
                      {isAuthenticating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.button>
                  </motion.form>

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between"
                  >
                    <p className="text-white/30 text-xs">
                      AI Detection System
                    </p>
                    <a
                      href="/admin"
                      className="text-amber-500/60 hover:text-amber-500 text-xs tracking-wider uppercase transition-colors"
                    >
                      Admin
                    </a>
                  </motion.div>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Ambient glow */}
              <div className="absolute -inset-4 bg-amber-500/5 rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
