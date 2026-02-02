'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingAnimationProps {
  className?: string;
  width?: number;
  height?: number;
  fps?: number;
}

const TOTAL_FRAMES = 24;

export default function LoadingAnimation({ 
  className = '', 
  width = 400, 
  height = 225,
  fps = 12 
}: LoadingAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all frames
  useEffect(() => {
    const preloadImages = async () => {
      const promises = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new window.Image();
        img.src = `/loading/frame_${i.toString().padStart(2, '0')}.jpg`;
        promises.push(
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
          })
        );
      }
      await Promise.all(promises);
      setIsLoaded(true);
    };
    preloadImages();
  }, []);

  // Animate frames
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % TOTAL_FRAMES);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isLoaded, fps]);

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-black/20 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height }}
    >
      <Image
        src={`/loading/frame_${currentFrame.toString().padStart(2, '0')}.jpg`}
        alt="Loading animation"
        fill
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );
}
