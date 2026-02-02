'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LamboLoginOverlay from '@/components/LamboLoginOverlay';

// Dynamically import background to avoid SSR issues with canvas
const LamboHighBeamBackground = dynamic(
  () => import('@/components/LamboHighBeamBackground'),
  { 
    ssr: false,
    loading: () => (
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: '#050505' }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 text-white/20">
            <svg viewBox="0 0 48 48" className="w-full h-full">
              <circle cx="24" cy="24" r="4" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase">
            Initializing
          </span>
        </div>
      </div>
    )
  }
);

export default function LamboLoginPage() {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Called when background completes animation cycle
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Cinematic Background Animation */}
      <LamboHighBeamBackground
        onAnimationComplete={handleAnimationComplete}
      />

      {/* Login UI Overlay - Always visible, floats above background */}
      <LamboLoginOverlay isVisible={true} />

      {/* Preload key frames for smoother experience */}
      <link rel="preload" as="image" href="/loading/frame_00.jpg" />
      <link rel="preload" as="image" href="/loading/frame_17.jpg" />
      <link rel="preload" as="image" href="/loading/frame_23.jpg" />
    </div>
  );
}
