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
        <div className="w-32 flex flex-col items-center gap-4">
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase">
            Initializing
          </span>
          <div className="w-full h-px bg-white/10 overflow-hidden">
            <div className="h-full bg-white/30 animate-progress" />
          </div>
        </div>
      </div>
    )
  }
);

export default function LamboLoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Called when background finishes loading and starts playing
  const handleAnimationStart = useCallback(() => {
    setAnimationStarted(true);
    // Show login UI after a brief delay to let animation establish
    setTimeout(() => {
      setShowLogin(true);
    }, 800);
  }, []);

  // Called when background completes first animation cycle
  const handleAnimationComplete = useCallback(() => {
    // Ensure login is visible when animation settles
    setShowLogin(true);
  }, []);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Cinematic Background Animation */}
      <LamboHighBeamBackground
        onAnimationComplete={handleAnimationComplete}
        totalFrames={24}
        targetFps={24}
      />

      {/* Login UI Overlay */}
      <LamboLoginOverlay isVisible={true} />

      {/* Preload hint for smoother experience */}
      <link rel="preload" as="image" href="/loading/frame_00.jpg" />
      <link rel="preload" as="image" href="/loading/frame_12.jpg" />
      <link rel="preload" as="image" href="/loading/frame_23.jpg" />
    </div>
  );
}
