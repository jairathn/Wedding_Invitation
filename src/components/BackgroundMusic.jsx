import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BackgroundMusic({ src = '/audio/background-music.mp3', startAt = 0, variant = 'light' }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedForVideo, setIsPausedForVideo] = useState(false);
  const audioRef = useRef(null);
  const targetVolumeRef = useRef(0.6); // 60% volume

  // Try to play audio after first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        // Start at 0 volume
        audioRef.current.volume = 0;
        if (startAt && audioRef.current.currentTime < startAt) {
          audioRef.current.currentTime = startAt;
        }

        audioRef.current.play().then(() => {
          setIsPlaying(true);

          // Fade in to 60% volume over 2 seconds
          const fadeInDuration = 2000; // 2 seconds
          const targetVolume = targetVolumeRef.current;
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
  }, [isPlaying, startAt]);

  // Listen for video play/pause events
  useEffect(() => {
    const handleVideoPlay = () => {
      if (audioRef.current && isPlaying && !isPausedForVideo) {
        audioRef.current.pause();
        setIsPausedForVideo(true);
      }
    };

    const handleVideoPause = () => {
      if (audioRef.current && isPlaying && isPausedForVideo) {
        audioRef.current.play();
        setIsPausedForVideo(false);
      }
    };

    window.addEventListener('video-play', handleVideoPlay);
    window.addEventListener('video-pause', handleVideoPause);
    window.addEventListener('video-ended', handleVideoPause);

    return () => {
      window.removeEventListener('video-play', handleVideoPlay);
      window.removeEventListener('video-pause', handleVideoPause);
      window.removeEventListener('video-ended', handleVideoPause);
    };
  }, [isPlaying, isPausedForVideo]);

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
        <source src={src} type="audio/mpeg" />
      </audio>

      {/* Night theme: a quiet engraved "Sound" toggle with three foil bars */}
      <AnimatePresence>
        {isPlaying && variant === 'night' && (
          <motion.button
            type="button"
            className="ty-caps fixed left-4 top-4 z-[25] flex min-h-[44px] items-center gap-2.5 text-[12px] lowercase text-ivory/60 transition-colors hover:text-foil-light md:left-7 md:top-6"
            onClick={toggleMute}
            aria-label={isMuted ? 'Turn the music on' : 'Turn the music off'}
            aria-pressed={!isMuted}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="flex h-[10px] items-end gap-[2px]" aria-hidden="true">
              {[5, 9, 6].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-[1.5px] origin-bottom bg-foil"
                  style={{ height: h }}
                  animate={isMuted ? { scaleY: 0.25 } : { scaleY: [1, 0.45, 0.9, 0.6, 1] }}
                  transition={isMuted ? { duration: 0.3 } : { duration: 1.4 + i * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </span>
            {isMuted ? 'Sound off' : 'Sound'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mute/Unmute button - bottom left */}
      <AnimatePresence>
        {isPlaying && variant !== 'night' && (
          <motion.button
            className="fixed bottom-6 left-6 z-[9998] w-12 h-12 rounded-full bg-warm-white/90 hover:bg-warm-white backdrop-blur-md flex items-center justify-center transition-colors shadow-lg"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
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
