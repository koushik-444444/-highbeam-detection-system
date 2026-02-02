'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    setMounted(true);
    const savedMute = localStorage.getItem('soundMuted');
    if (savedMute === 'true') {
      setIsMuted(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem('soundMuted', String(newValue));
      
      // Mute/unmute all active sounds
      audioRefs.current.forEach((audio) => {
        audio.muted = newValue;
      });
      
      return newValue;
    });
  }, []);

  const play = useCallback((soundName: string, options: SoundOptions = {}) => {
    if (!mounted) return;
    
    const { volume = 0.3, loop = false } = options;
    
    try {
      // Create new audio element
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = volume;
      audio.loop = loop;
      audio.muted = isMuted;
      
      const id = Math.random().toString(36).substring(7);
      audioRefs.current.set(id, audio);
      
      audio.play().catch(() => {
        // Autoplay blocked, ignore
      });
      
      audio.addEventListener('ended', () => {
        audioRefs.current.delete(id);
      });
      
      return id;
    } catch {
      // Sound not available, ignore
      return undefined;
    }
  }, [mounted, isMuted]);

  const stop = useCallback((id?: string) => {
    if (id) {
      const audio = audioRefs.current.get(id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audioRefs.current.delete(id);
      }
    } else {
      // Stop all sounds
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRefs.current.clear();
    }
  }, []);

  const playNotification = useCallback(() => {
    play('notification', { volume: 0.2 });
  }, [play]);

  const playWarning = useCallback(() => {
    play('warning', { volume: 0.25 });
  }, [play]);

  const playSuccess = useCallback(() => {
    play('success', { volume: 0.2 });
  }, [play]);

  const playEngine = useCallback(() => {
    return play('engine-hum', { volume: 0.15, loop: true });
  }, [play]);

  return {
    play,
    stop,
    playNotification,
    playWarning,
    playSuccess,
    playEngine,
    isMuted,
    toggleMute,
    mounted,
  };
}

// Sound Toggle Button Component
export function SoundToggle({ className = '' }: { className?: string }) {
  const { isMuted, toggleMute, mounted } = useSound();

  if (!mounted) return null;

  return (
    <motion.button
      onClick={toggleMute}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all ${className}`}
      title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-white/40" />
      ) : (
        <Volume2 className="w-4 h-4 text-cyan-400" />
      )}
    </motion.button>
  );
}
