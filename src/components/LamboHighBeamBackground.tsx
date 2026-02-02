'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LamboHighBeamBackgroundProps {
  onAnimationComplete?: () => void;
}

const TOTAL_FRAMES = 192;
const TARGET_FPS = 24;
const FRAMES_TO_START = 48; // Start playing after loading first 2 seconds worth of frames

// Particle configuration
const PARTICLE_COUNT = 30;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

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
  const particlesRef = useRef<Particle[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [canPlay, setCanPlay] = useState(false); // Can start playing early

  const frameInterval = 1000 / TARGET_FPS;

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.05 - 0.02,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, []);

  // Update particles
  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current.map(p => {
      let newX = p.x + p.speedX;
      let newY = p.y + p.speedY;
      
      // Wrap around
      if (newX < 0) newX = 100;
      if (newX > 100) newX = 0;
      if (newY < 0) newY = 100;
      if (newY > 100) newY = 0;
      
      return { ...p, x: newX, y: newY };
    });
  }, []);

  // Preload frames - start playing after first batch
  useEffect(() => {
    const loadImages = async () => {
      let loaded = 0;
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
                
                // Store images as they load so animation can access them
                imagesRef.current = [...allImages];
                
                // Start playing early after first batch loads
                if (loaded >= FRAMES_TO_START && !canPlay) {
                  setCanPlay(true);
                  setIsLoading(false);
                }
                
                resolve();
              };
              
              img.onerror = () => {
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
                  imagesRef.current = [...allImages];
                  
                  if (loaded >= FRAMES_TO_START && !canPlay) {
                    setCanPlay(true);
                    setIsLoading(false);
                  }
                  
                  resolve();
                };
              };
            })
          );
        }
        await Promise.all(batchPromises);
      }

      imagesRef.current = allImages;
    };

    loadImages();
  }, [canPlay]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPlayingRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Draw frame to canvas
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    
    const cropBottom = 40;
    const srcX = 0;
    const srcY = 0;
    const srcWidth = imgWidth;
    const srcHeight = imgHeight - cropBottom;
    
    const srcAspect = srcWidth / srcHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let destWidth, destHeight, destX, destY;
    
    if (canvasAspect > srcAspect) {
      destWidth = canvasWidth;
      destHeight = canvasWidth / srcAspect;
      destX = 0;
      destY = (canvasHeight - destHeight) / 2;
    } else {
      destHeight = canvasHeight;
      destWidth = canvasHeight * srcAspect;
      destX = (canvasWidth - destWidth) / 2;
      destY = 0;
    }
    
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      image,
      srcX, srcY, srcWidth, srcHeight,
      destX, destY, destWidth, destHeight
    );
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canPlay || imagesRef.current.length === 0) return;

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
        
        // Only draw if the frame is loaded
        if (image) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawFrame(ctx, image);
        }

        // Update particles
        updateParticles();
        
        // Update current frame state for effects
        setCurrentFrame(frame);

        currentFrameRef.current++;
        
        // Loop back to start, but only if we have frames loaded there
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
  }, [canPlay, frameInterval, onAnimationComplete, drawFrame, updateParticles]);

  // Calculate effects intensity based on current frame
  // Frames 60-120 are typically the "high beam on + approaching" phase
  const effectsIntensity = Math.min(1, Math.max(0, (currentFrame - 40) / 80));
  // DISABLED zoom and lens flare to keep video crisp
  const zoomScale = 1; // No zoom - keeps video sharp
  const lensFlareOpacity = 0; // No lens flare - keeps video crisp

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
            <div className="flex flex-col items-center gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <svg viewBox="0 0 100 60" className="w-20 h-12 text-cyan-500/80">
                  <path
                    fill="currentColor"
                    d="M50 5 L20 25 L5 20 L15 35 L10 55 L30 45 L50 55 L70 45 L90 55 L85 35 L95 20 L80 25 L50 5Z"
                  />
                </svg>
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 blur-xl bg-cyan-500/20"
                />
              </motion.div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-[2px] bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
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

      {/* Canvas with zoom effect */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: isLoading ? 1 : zoomScale }}
        transition={{ duration: 0.1, ease: 'linear' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: '#050505' }}
        />
      </motion.div>

      {/* Lens Flare Effect - DISABLED for crisp video */}
      {/* Keeping the structure but with 0 opacity */}
      {false && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isLoading ? 0 : lensFlareOpacity }}
          transition={{ duration: 0.2 }}
        >
          {/* Central headlight glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(200,230,255,0.15) 0%, rgba(100,180,255,0.05) 40%, transparent 70%)',
            }}
          />
          {/* Horizontal lens streak */}
          <div 
            className="absolute top-[45%] left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent 20%, rgba(200,230,255,0.1) 40%, rgba(255,255,255,0.2) 50%, rgba(200,230,255,0.1) 60%, transparent 80%)',
            }}
          />
          {/* Secondary flare spots */}
          <div 
            className="absolute top-[40%] left-[30%] w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(100,200,255,0.2) 0%, transparent 70%)',
            }}
          />
          <div 
            className="absolute top-[50%] left-[65%] w-12 h-12 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(150,200,255,0.15) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      )}

      {/* Floating Particles - DISABLED for crisp video */}
      {false && !isLoading && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particlesRef.current.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity * effectsIntensity,
              }}
              animate={{
                opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette Overlay - DISABLED for crisp video */}
      {false && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 80% at 50% 50%, 
                transparent 0%, 
                transparent 60%, 
                rgba(0,0,0,0.2) 85%, 
                rgba(0,0,0,0.4) 100%
              )
            `,
          }}
        />
      )}

      {/* Top and bottom gradient bars - DISABLED for crisp video */}
      {false && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }}
          />
        </>
      )}
    </div>
  );
}
