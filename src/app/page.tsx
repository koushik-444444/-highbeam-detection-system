'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LamboLoginOverlay from '@/components/LamboLoginOverlay';

// Dynamic import for canvas component
const LamboHighBeamBackground = dynamic(
  () => import('@/components/LamboHighBeamBackground'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <svg viewBox="0 0 100 60" className="w-16 h-10 text-amber-500/50">
            <path
              fill="currentColor"
              d="M50 5 L20 25 L5 20 L15 35 L10 55 L30 45 L50 55 L70 45 L90 55 L85 35 L95 20 L80 25 L50 5Z"
            />
          </svg>
          <span className="text-white/30 text-xs tracking-[0.2em] uppercase">
            Initializing
          </span>
        </div>
      </div>
    )
  }
);

export default function LamboLoginPage() {
  const [animationReady, setAnimationReady] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setAnimationReady(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      {/* Full-screen looping animation background */}
      <LamboHighBeamBackground onAnimationComplete={handleAnimationComplete} />

      {/* Premium login overlay */}
      <LamboLoginOverlay isVisible={true} />
    </div>
  );
}
