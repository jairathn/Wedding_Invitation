import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Try to play audio after first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        // Start at 0 volume
        audioRef.current.volume = 0;

        audioRef.current.play().then(() => {
          setIsPlaying(true);

          // Fade in to 40% volume over 2 seconds
          const fadeInDuration = 2000; // 2 seconds
          const targetVolume = 0.4;
          const steps = 50;
          const volumeIncrement = targetVolume / steps;
          const intervalTime = fadeInDuration / steps;

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            if (currentStep < steps && audioRef.current) {
              audioRef.current.volume = Math.min(volumeIncrement * currentStep, targetVolume);
              currentStep++;
            } else {
              clearInterval(fadeInterval);
            }
          }, intervalTime);
        }).catch((error) => {
          console.log('Audio autoplay prevented:', error);
        });
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isPlaying]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Background audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/audio/background-music.mp3" type="audio/mpeg" />
      </audio>

      {/* Mute/Unmute button - bottom left */}
      <AnimatePresence>
        {isPlaying && (
          <motion.button
            className="fixed bottom-6 left-6 z-[9998] w-12 h-12 rounded-full bg-warm-white/90 hover:bg-warm-white backdrop-blur-md flex items-center justify-center transition-colors shadow-lg"
            onClick={toggleMute}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? (
              // Muted icon
              <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              // Unmuted icon
              <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
