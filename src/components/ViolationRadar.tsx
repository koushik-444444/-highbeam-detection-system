'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Crosshair, Radar as RadarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface Violation {
  _id: string;
  location: Location;
  beamIntensity: number;
  detectionTimestamp: string;
}

interface ViolationRadarProps {
  violations: Violation[];
}

export default function ViolationRadar({ violations }: ViolationRadarProps) {
  const [activeBlip, setActiveBlip] = useState<Violation | null>(null);
  const [radarRotation, setRadarRotation] = useState(0);

  // Normalize coordinates for radar display
  // In a real app, we'd use a map projection. Here we map lat/long to a 0-100 range.
  const getPosition = (lat: number, lng: number) => {
    // These are simplified mock projections
    const x = ((lng + 180) % 360) / 360 * 100;
    const y = ((lat + 90) % 180) / 180 * 100;
    
    // Spread them a bit for the radar view (center-weighted)
    const centerX = 50 + (Math.sin(lat * 10) * 30);
    const centerY = 50 + (Math.cos(lng * 10) * 30);
    
    return { x: centerX, y: centerY };
  };

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-black/40 rounded-full border border-cyan-500/20 p-4 overflow-hidden group">
      {/* Radar Background Grids */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[80%] rounded-full border border-cyan-500/10" />
        <div className="w-[60%] h-[60%] rounded-full border border-cyan-500/10" />
        <div className="w-[40%] h-[40%] rounded-full border border-cyan-500/10" />
        <div className="w-[20%] h-[20%] rounded-full border border-cyan-500/10" />
        
        {/* Crosshair Axes */}
        <div className="absolute w-full h-[1px] bg-cyan-500/10" />
        <div className="absolute h-full w-[1px] bg-cyan-500/10" />
      </div>

      {/* Radar Sweep Animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, rgba(6,182,212,0.15) 0deg, rgba(6,182,212,0.1) 20deg, transparent 40deg)',
        }}
      />

      {/* Violation Blips */}
      <div className="absolute inset-0 z-20">
        {violations.map((v) => {
          const { x, y } = getPosition(v.location.latitude, v.location.longitude);
          const isActive = activeBlip?._id === v._id;

          return (
            <motion.button
              key={v._id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.5, zIndex: 50 }}
              onClick={() => setActiveBlip(v)}
              className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 group/blip"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Blip Outer Ring */}
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-full border ${v.beamIntensity > 80 ? 'border-red-500' : 'border-cyan-500'}`}
              />
              {/* Core Point */}
              <div className={`w-full h-full rounded-full shadow-lg ${v.beamIntensity > 80 ? 'bg-red-500 shadow-red-500/50' : 'bg-cyan-500 shadow-cyan-500/50'}`} />
              
              {/* Active Indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -inset-2 border border-white/40 rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* UI Elements */}
      <div className="absolute inset-4 pointer-events-none z-30 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
            <RadarIcon className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-mono tracking-tighter">GEOSPATIAL_RADAR v1.2</span>
          </div>
          <div className="text-[10px] text-white/40 font-mono">
            RANGE: 5.0 KM<br />
            SCAN: ACTIVE
          </div>
        </div>

        {/* Info Box for Selected Blip */}
        <AnimatePresence>
          {activeBlip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl pointer-events-auto"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Target Identified</h4>
                  <p className="text-xs text-white font-medium truncate max-w-[150px]">{activeBlip.location.address}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-mono ${activeBlip.beamIntensity > 80 ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  INTENSITY: {activeBlip.beamIntensity}%
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 rounded p-1.5">
                  <span className="text-[8px] text-white/20 block uppercase">Lat</span>
                  <span className="text-[10px] text-white/60 font-mono">{activeBlip.location.latitude.toFixed(4)}</span>
                </div>
                <div className="flex-1 bg-white/5 rounded p-1.5">
                  <span className="text-[8px] text-white/20 block uppercase">Long</span>
                  <span className="text-[10px] text-white/60 font-mono">{activeBlip.location.longitude.toFixed(4)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 text-white/20" />
            <span className="text-[10px] text-white/20 font-mono tracking-tighter">NORTH_ALIGNED_TRUE</span>
          </div>
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-[9px] text-cyan-500/60 font-mono uppercase tracking-widest">Live Feed</span>
          </motion.div>
        </div>
      </div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />
    </div>
  );
}
