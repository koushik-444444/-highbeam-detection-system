'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GlassCard, Button, Input, PoliceScanner, AnimatedGrid } from '@/components/ui';
import { Car, Calendar, Shield, AlertTriangle } from 'lucide-react';

// Dynamically import 3D scene to avoid SSR issues
const CarScene = dynamic(() => import('@/components/three/CarScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
      <div className="text-cyan-400 text-xl animate-pulse">Loading 3D Scene...</div>
    </div>
  ),
});

export default function AuthPage() {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, dob }),
      });

      const data = await response.json();

      if (data.success) {
        // Flash warning effect if violations exist
        if (data.hasViolations) {
          setShowWarning(true);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* 3D Background - Positioned behind content */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <CarScene />
        </Suspense>
      </div>

      {/* Dark overlay to improve form visibility */}
      <div className="absolute inset-0 z-5 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/70" />

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-50">
        <AnimatedGrid />
      </div>
      
      {/* Police Scanner Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30">
        <PoliceScanner />
      </div>

      {/* Warning Flash */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 1] }}
            className="absolute inset-0 bg-red-600/30 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-center"
            >
              <AlertTriangle className="w-32 h-32 text-red-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white">VIOLATION DETECTED</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">HIGH BEAM</h1>
              <p className="text-xs text-cyan-400">Detection System</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <a 
              href="/admin"
              className="text-white/70 hover:text-white transition-colors text-sm bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              Admin Portal
            </a>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Enhanced Glass Card with stronger background */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            {/* Gradient overlay for card */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Title */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Vehicle Verification
                </h2>
                <p className="text-white/60 text-sm">
                  Enter your vehicle details to check violation status
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Vehicle Number"
                  value={vehicleNumber}
                  onChange={setVehicleNumber}
                  placeholder="MH 12 AB 1234"
                  icon={<Car className="w-5 h-5" />}
                  error={error && !vehicleNumber ? 'Required' : ''}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={setDob}
                  icon={<Calendar className="w-5 h-5" />}
                  error={error && !dob ? 'Required' : ''}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-4"
                >
                  Check Status
                </Button>
              </form>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-white/10 text-center"
              >
                <p className="text-white/40 text-xs">
                  Powered by AI Detection System
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Traffic Police Department
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: '🚗', label: 'AI Detection' },
              { icon: '📸', label: 'Evidence Capture' },
              { icon: '💳', label: 'Online Payment' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-white/60 text-xs">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <p className="text-center text-white/30 text-xs">
          © 2024 Smart City Traffic Management. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
