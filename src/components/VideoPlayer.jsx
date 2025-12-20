import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setHasError(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative">
      {/* Decorative frame */}
      <div className="absolute -inset-2 border border-golden/30" />
      <div className="absolute -inset-1 border border-golden/20" />

      <motion.div
        className="relative aspect-video bg-charcoal overflow-hidden cursor-pointer group"
        onClick={handlePlayClick}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3 }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onError={() => setHasError(true)}
          playsInline
          preload="metadata"
          poster="/images/engagement-photo.jpg"
        >
          <source src="/video/Invitation_Video.mp4" type="video/mp4" />
        </video>

        {/* Play button overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: isPlaying ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-charcoal/40" />

          {/* Play button */}
          <motion.div
            className="relative z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer ring */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-warm-white/80 flex items-center justify-center backdrop-blur-sm bg-warm-white/10">
              {/* Inner circle */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-warm-white/90 flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-terracotta ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* "Play" text */}
          {!hasError && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-serif text-sm text-warm-white/80 italic tracking-wide">
              Play Video
            </p>
          )}
        </motion.div>

        {/* Error/placeholder state */}
        {hasError && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/80">
            <div className="text-center px-4">
              <p className="font-serif text-warm-white/80 italic mb-2">Video coming soon</p>
              <p className="font-sans text-xs text-warm-white/50">Check back for our story</p>
            </div>
          </div>
        )}

        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)',
          }}
        />
      </motion.div>
    </div>
  );
}
