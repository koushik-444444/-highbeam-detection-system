'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Shield, Cpu, Activity } from 'lucide-react';

interface EvidenceScannerProps {
  imageUrl: string;
  intensity: number;
  confidence: number;
}

export default function EvidenceScanner({ imageUrl, intensity, confidence }: EvidenceScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [showData, setShowData] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
      setShowData(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group">
      {/* The Evidence Image */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Violation Evidence"
          className={`w-full h-full object-cover transition-all duration-700 ${isScanning ? 'brightness-50 grayscale' : 'brightness-100 grayscale-0'}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
          <Camera className="w-12 h-12 mb-2" />
          <p className="text-sm tracking-widest uppercase font-light">Signal Lost</p>
        </div>
      )}

      {/* Scanning Line */}
      <AnimatePresence mode="wait">
        {isScanning && (
          <motion.div
            key="scanner-line"
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-[2px] bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20"
          />
        )}
      </AnimatePresence>

      {/* AI Hotspot Highlight */}
      <AnimatePresence>
        {showData && imageUrl && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          >
            {/* Target Reticle */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-cyan-500/40 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 sm:w-4 sm:h-4 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]"
              />
              {/* Data Callout */}
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-2 min-w-[100px] sm:min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[8px] sm:text-[10px] text-cyan-400 font-mono uppercase tracking-tighter">Intensity Peak</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white font-mono">{intensity}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Overlays */}
      <div className="absolute inset-0 p-3 sm:p-4 pointer-events-none flex flex-col justify-between z-20">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/5">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="text-[8px] sm:text-[9px] text-white/60 tracking-widest uppercase font-mono">Vision Processor v2.4</span>
            </div>
            {showData && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-cyan-500/10 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/20 text-[8px] sm:text-[9px] text-cyan-400 font-mono"
              >
                CONFIDENCE: {(confidence * 100).toFixed(2)}%
              </motion.div>
            )}
          </div>
          
          <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/5">
            <span className="text-[8px] sm:text-[9px] text-red-500 tracking-widest uppercase font-mono animate-pulse">● REC</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="text-[8px] sm:text-[9px] text-white/20 font-mono">
            REF_X: {Math.floor(Math.random() * 1000)}<br />
            REF_Y: {Math.floor(Math.random() * 1000)}
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em]">Enforcement Verified</span>
          </div>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
    </div>
  );
}
