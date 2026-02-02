'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LamboHighBeamBackgroundProps {
  onAnimationComplete?: () => void;
  totalFrames?: number;
  targetFps?: number;
}

export default function LamboHighBeamBackground({
  onAnimationComplete,
  totalFrames = 24,
  targetFps = 24,
}: LamboHighBeamBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const frameInterval = 1000 / targetFps;

  // Preload all frames
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      let loaded = 0;

      const loadPromises = Array.from({ length: totalFrames }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          // Format: frame_00.jpg, frame_01.jpg, etc.
          const frameNum = i.toString().padStart(2, '0');
          img.src = `/loading/frame_${frameNum}.jpg`;
          
          img.onload = () => {
            loaded++;
            setLoadProgress(Math.round((loaded / totalFrames) * 100));
            resolve(img);
          };
          
          img.onerror = () => {
            console.warn(`Failed to load frame ${i}`);
            // Create a fallback black frame
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
              setLoadProgress(Math.round((loaded / totalFrames) * 100));
              resolve(fallbackImg);
            };
          };
        });
      });

      try {
        const results = await Promise.all(loadPromises);
        imagesRef.current = results;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading frames:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [totalFrames]);

  // Handle visibility change (pause when tab inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPlayingRef.current = !document.hidden;
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Draw frame to canvas with proper scaling
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    
    // Calculate cover scaling (fill entire canvas)
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Center the image
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;
    
    // Clear with background color
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw the frame
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isLoading || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Draw first frame immediately
    if (imagesRef.current[0]) {
      drawFrame(ctx, imagesRef.current[0]);
    }

    const animate = (timestamp: number) => {
      if (!isPlayingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);
        
        const currentFrame = currentFrameRef.current;
        const image = imagesRef.current[currentFrame];
        
        if (image) {
          // Reset canvas size accounting for DPR
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
          drawFrame(ctx, image);
        }

        // Advance frame
        currentFrameRef.current++;
        
        // Check if animation completed one cycle
        if (currentFrameRef.current >= totalFrames) {
          if (!hasCompleted) {
            setHasCompleted(true);
            onAnimationComplete?.();
          }
          // Loop back to last few frames for subtle idle animation
          currentFrameRef.current = Math.max(0, totalFrames - 4);
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
  }, [isLoading, totalFrames, frameInterval, hasCompleted, onAnimationComplete, drawFrame]);

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
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#050505' }}
          >
            {/* Minimal progress indicator */}
            <div className="w-32 flex flex-col items-center gap-4">
              <span className="text-white/40 text-xs tracking-[0.3em] uppercase">
                Loading
              </span>
              <div className="w-full h-px bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-white/20 text-xs font-mono">
                {loadProgress}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#050505',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-out'
        }}
      />

      {/* Subtle vignette overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5,5,5,0.4) 100%)'
        }}
      />

      {/* Optional idle shimmer effect after animation completes */}
      <AnimatePresence>
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pointer-events-none animate-headlight-shimmer"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(212, 229, 247, 0.03) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
