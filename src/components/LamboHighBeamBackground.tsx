'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LamboHighBeamBackgroundProps {
  onAnimationComplete?: () => void;
}

const TOTAL_FRAMES = 192;
const TARGET_FPS = 24; // Original animation timing (~0.042s per frame = 24fps)

export default function LamboHighBeamBackground({
  onAnimationComplete,
}: LamboHighBeamBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const loopCountRef = useRef<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const frameInterval = 1000 / TARGET_FPS;

  // Preload all 192 frames
  useEffect(() => {
    const loadImages = async () => {
      let loaded = 0;

      // Load frames in batches for better performance
      const batchSize = 24;
      const batches = Math.ceil(TOTAL_FRAMES / batchSize);
      const allImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);

      for (let batch = 0; batch < batches; batch++) {
        const start = batch * batchSize;
        const end = Math.min(start + batchSize, TOTAL_FRAMES);
        
        const batchPromises = [];
        for (let i = start; i < end; i++) {
          batchPromises.push(
            new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              const frameNum = i.toString().padStart(3, '0');
              img.src = `/loading/frame_${frameNum}.jpg`;
              
              img.onload = () => {
                allImages[i] = img;
                loaded++;
                setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
                resolve();
              };
              
              img.onerror = () => {
                // Create black fallback
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
                  allImages[i] = fallbackImg;
                  loaded++;
                  setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
                  resolve();
                };
              };
            })
          );
        }
        await Promise.all(batchPromises);
      }

      imagesRef.current = allImages;
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPlayingRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Draw frame to canvas - crops out Veo watermark from bottom-right
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    
    // Crop settings to remove Veo watermark (bottom-right corner)
    // Original frame: 800x450, watermark is ~120x35px in bottom-right
    const cropRight = 0; // pixels to crop from right
    const cropBottom = 40; // pixels to crop from bottom (hides watermark)
    const cropTop = 0;
    const cropLeft = 0;
    
    // Source dimensions (what we're taking from the image)
    const srcX = cropLeft;
    const srcY = cropTop;
    const srcWidth = imgWidth - cropLeft - cropRight;
    const srcHeight = imgHeight - cropTop - cropBottom;
    
    // Calculate cover scaling for cropped source
    const srcAspect = srcWidth / srcHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let destWidth, destHeight, destX, destY;
    
    if (canvasAspect > srcAspect) {
      // Canvas is wider - fit to width
      destWidth = canvasWidth;
      destHeight = canvasWidth / srcAspect;
      destX = 0;
      destY = (canvasHeight - destHeight) / 2;
    } else {
      // Canvas is taller - fit to height
      destHeight = canvasHeight;
      destWidth = canvasHeight * srcAspect;
      destX = (canvasWidth - destWidth) / 2;
      destY = 0;
    }
    
    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw cropped image (excludes watermark area)
    ctx.drawImage(
      image,
      srcX, srcY, srcWidth, srcHeight,  // Source rectangle (crops out watermark)
      destX, destY, destWidth, destHeight // Destination rectangle (fills canvas)
    );
  }, []);

  // Animation loop
  useEffect(() => {
    if (isLoading || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Draw first frame
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
        
        const frame = currentFrameRef.current;
        const image = imagesRef.current[frame];
        
        if (image) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawFrame(ctx, image);
        }

        currentFrameRef.current++;
        
        // Loop animation
        if (currentFrameRef.current >= TOTAL_FRAMES) {
          currentFrameRef.current = 0;
          loopCountRef.current++;
          if (loopCountRef.current === 1) {
            onAnimationComplete?.();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoading, frameInterval, onAnimationComplete, drawFrame]);

  return (
    <div className="fixed inset-0 z-0" style={{ backgroundColor: '#050505' }}>
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#050505' }}
          >
            {/* Lamborghini-style loading */}
            <div className="flex flex-col items-center gap-8">
              {/* Bull logo silhouette */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <svg viewBox="0 0 100 60" className="w-20 h-12 text-amber-500/80">
                  <path
                    fill="currentColor"
                    d="M50 5 L20 25 L5 20 L15 35 L10 55 L30 45 L50 55 L70 45 L90 55 L85 35 L95 20 L80 25 L50 5Z"
                  />
                </svg>
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 blur-xl bg-amber-500/20"
                />
              </motion.div>

              {/* Progress */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-[2px] bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                    style={{ width: `${loadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-light">
                  {loadProgress < 100 ? 'Loading Experience' : 'Ready'}
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
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: '#050505' }}
      />
    </div>
  );
}
