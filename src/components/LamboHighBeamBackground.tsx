'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LamboHighBeamBackgroundProps {
  onAnimationComplete?: () => void;
}

// Curated key frames for cinematic effect
// Selected for visual impact and smooth transitions
const KEY_FRAMES = [
  'frame_00', // Dark start
  'frame_03', // Subtle awakening
  'frame_06', // Pre-ignition
  'frame_09', // Headlights warming
  'frame_12', // High beam activating
  'frame_14', // Peak intensity
  'frame_16', // Maximum brightness
  'frame_17', // Hero frame - full high beam
  'frame_18', // Beginning to settle
  'frame_20', // Adaptive dimming
  'frame_22', // Near idle
  'frame_23', // Final idle state
];

// Very slow FPS for cinematic, luxurious feel
const TARGET_FPS = 6;

export default function LamboHighBeamBackground({
  onAnimationComplete,
}: LamboHighBeamBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const currentFrameIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const hasStartedRef = useRef<boolean>(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'loading' | 'playing' | 'idle'>('loading');

  const frameInterval = 1000 / TARGET_FPS;
  const totalKeyFrames = KEY_FRAMES.length;

  // Preload curated key frames only
  useEffect(() => {
    const loadImages = async () => {
      let loaded = 0;

      const loadPromises = KEY_FRAMES.map((frameName, i) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `/loading/${frameName}.jpg`;
          
          img.onload = () => {
            loaded++;
            setLoadProgress(Math.round((loaded / totalKeyFrames) * 100));
            resolve(img);
          };
          
          img.onerror = () => {
            console.warn(`Failed to load ${frameName}`);
            // Create fallback black frame
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 450;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#050505';
              ctx.fillRect(0, 0, 800, 450);
            }
            const fallbackImg = new Image();
            fallbackImg.src = canvas.toDataURL();
            fallbackImg.onload = () => {
              loaded++;
              setLoadProgress(Math.round((loaded / totalKeyFrames) * 100));
              resolve(fallbackImg);
            };
          };
        });
      });

      try {
        const results = await Promise.all(loadPromises);
        imagesRef.current = results;
        setIsLoading(false);
        setCurrentPhase('playing');
      } catch (error) {
        console.error('Error loading frames:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [totalKeyFrames]);

  // Handle visibility change (pause when tab inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPlayingRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Draw frame with smooth crossfade potential
  const drawFrame = useCallback((
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement,
    opacity: number = 1
  ) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    
    // Calculate cover scaling
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Center the image
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;
    
    // Apply opacity for crossfade
    ctx.globalAlpha = opacity;
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1;
  }, []);

  // Main animation loop
  useEffect(() => {
    if (isLoading || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size with DPR
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Draw first frame immediately
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (imagesRef.current[0]) {
      drawFrame(ctx, imagesRef.current[0]);
    }

    const animate = (timestamp: number) => {
      if (!isPlayingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);
        
        const frameIndex = currentFrameIndexRef.current;
        const image = imagesRef.current[frameIndex];
        
        if (image) {
          // Clear and draw
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawFrame(ctx, image);
        }

        // Advance to next key frame
        currentFrameIndexRef.current++;
        
        // Check completion
        if (currentFrameIndexRef.current >= totalKeyFrames) {
          if (!hasCompleted) {
            setHasCompleted(true);
            setCurrentPhase('idle');
            onAnimationComplete?.();
          }
          // Hold on last frame (idle state) - no more looping for calm effect
          currentFrameIndexRef.current = totalKeyFrames - 1;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, totalKeyFrames, frameInterval, hasCompleted, onAnimationComplete, drawFrame]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#050505' }}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Minimal high beam icon */}
              <motion.div
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12"
              >
                <svg viewBox="0 0 48 48" className="w-full h-full text-white/40">
                  <circle cx="24" cy="24" r="4" fill="currentColor"/>
                  <path 
                    d="M24 8v4M24 36v4M8 24h4M36 24h4M13.5 13.5l2.8 2.8M31.7 31.7l2.8 2.8M13.5 34.5l2.8-2.8M31.7 16.3l2.8-2.8" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </motion.div>
              
              {/* Progress bar */}
              <div className="w-24 flex flex-col items-center gap-3">
                <div className="w-full h-px bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-white/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadProgress}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase">
                  {loadProgress < 100 ? 'Loading' : 'Ready'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <motion.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: '#050505' }}
      />

      {/* Cinematic vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, transparent 40%, rgba(5,5,5,0.6) 100%)
          `
        }}
      />

      {/* Subtle headlight glow overlay when idle */}
      <AnimatePresence>
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Slow breathing glow */}
            <motion.div
              animate={{ opacity: [0.02, 0.05, 0.02] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 50% 35% at 50% 48%, rgba(200, 220, 240, 0.08) 0%, transparent 70%)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
