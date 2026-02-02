'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface LamboLoginOverlayProps {
  isVisible: boolean;
}

// Typing animation for placeholder
const useTypingPlaceholder = (texts: string[], typingSpeed = 100, pauseDuration = 2000) => {
  const [placeholder, setPlaceholder] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setPlaceholder(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? typingSpeed / 2 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, pauseDuration]);

  return placeholder;
};

export default function LamboLoginOverlay({ isVisible }: LamboLoginOverlayProps) {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const vehiclePlaceholder = useTypingPlaceholder(
    ['MH 12 AB 1234', 'KA 01 CD 5678', 'DL 02 EF 9012'],
    80,
    3000
  );

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
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'radial-gradient(circle at center, rgba(180,50,50,0.3) 0%, rgba(100,20,20,0.5) 100%)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(255,80,80,0.3)',
                    '0 0 40px rgba(255,80,80,0.6)',
                    '0 0 20px rgba(255,80,80,0.3)',
                  ]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-red-500 flex items-center justify-center bg-red-500/10"
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

      {/* Main Login Overlay */}
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-10 flex items-center justify-center">
            {/* Login Card - Positioned lower for automotive feel */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[300px] mx-4"
            >
              {/* Glassmorphism Card with Gradient Border */}
              <div className="relative group">
                {/* Gradient border glow */}
                <div 
                  className="absolute -inset-[1px] rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100,200,255,0.3) 0%, rgba(50,150,255,0.1) 50%, rgba(100,200,255,0.3) 100%)',
                  }}
                />
                
                {/* Ambient glow behind card */}
                <motion.div
                  className="absolute -inset-8 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(100,180,255,0.1) 0%, transparent 70%)',
                  }}
                />
                
                {/* Main card */}
                <div className="relative bg-black/60 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Animated top accent line */}
                  <motion.div 
                    className="h-[1px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(100,200,255,0.6), transparent)',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  
                  <div className="p-6">
                    {/* Header */}
                    <motion.div 
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {/* Animated icon */}
                      <motion.div
                        className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full border border-cyan-500/30 bg-cyan-500/5"
                        whileHover={{ scale: 1.05, borderColor: 'rgba(100,200,255,0.5)' }}
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(100,200,255,0.1)',
                            '0 0 20px rgba(100,200,255,0.2)',
                            '0 0 10px rgba(100,200,255,0.1)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                      </motion.div>
                      
                      <h1 className="text-white/90 text-sm font-light tracking-[0.25em] uppercase">
                        High Beam
                      </h1>
                      <p className="text-cyan-400/60 text-[10px] tracking-[0.2em] uppercase mt-1">
                        Detection System
                      </p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      onSubmit={handleAuthenticate}
                      className="space-y-4"
                    >
                      {/* Vehicle Number Input */}
                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[10px] tracking-wider uppercase block">
                          Vehicle No.
                        </label>
                        <motion.div
                          className="relative"
                          animate={{
                            boxShadow: focusedInput === 'vehicle' 
                              ? '0 0 20px rgba(100,200,255,0.15)' 
                              : '0 0 0px transparent',
                          }}
                        >
                          <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                            onFocus={() => setFocusedInput('vehicle')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder={vehiclePlaceholder}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300 tracking-wider"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          {/* Focus indicator */}
                          <motion.div
                            className="absolute bottom-0 left-1/2 h-[1px] bg-cyan-400"
                            initial={{ width: 0, x: '-50%' }}
                            animate={{ 
                              width: focusedInput === 'vehicle' ? '80%' : '0%',
                              x: '-50%'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                      </div>

                      {/* Date of Birth Input */}
                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[10px] tracking-wider uppercase block">
                          Date of Birth
                        </label>
                        <motion.div
                          className="relative"
                          animate={{
                            boxShadow: focusedInput === 'dob' 
                              ? '0 0 20px rgba(100,200,255,0.15)' 
                              : '0 0 0px transparent',
                          }}
                        >
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            onFocus={() => setFocusedInput('dob')}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                            style={{ colorScheme: 'dark' }}
                          />
                          <motion.div
                            className="absolute bottom-0 left-1/2 h-[1px] bg-cyan-400"
                            initial={{ width: 0, x: '-50%' }}
                            animate={{ 
                              width: focusedInput === 'dob' ? '80%' : '0%',
                              x: '-50%'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="overflow-hidden"
                          >
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-red-400/80 text-xs text-center">{error}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isAuthenticating || !vehicleNumber || !dob}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(100,200,255,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden text-xs"
                      >
                        <span className={isAuthenticating ? 'opacity-0' : 'opacity-100'}>
                          Authenticate
                        </span>
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 -translate-x-full"
                          animate={{ translateX: ['100%', '-100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          }}
                        />
                        
                        {isAuthenticating && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                              className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </div>
                        )}
                      </motion.button>
                    </motion.form>

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between"
                    >
                      <p className="text-white/20 text-[9px] tracking-wider">
                        AI Detection
                      </p>
                      <a
                        href="/admin"
                        className="text-cyan-500/40 hover:text-cyan-400 text-[9px] tracking-wider uppercase transition-colors"
                      >
                        Admin
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
