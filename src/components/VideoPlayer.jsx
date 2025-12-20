import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      className="relative w-full aspect-video bg-charcoal rounded-lg overflow-hidden shadow-xl cursor-pointer group"
      onClick={handlePlayClick}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onEnded={handleVideoEnd}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        preload="metadata"
      >
        <source src="/video/Invitation_Video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play button overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-charcoal/40 transition-opacity duration-300"
        animate={{ opacity: isPlaying ? 0 : 1 }}
        style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
      >
        <motion.div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-warm-white/90 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-terracotta"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-terracotta ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* Video not available placeholder */}
      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-terracotta/20 to-golden/20 pointer-events-none">
          <div className="text-center text-warm-white">
            <p className="font-serif text-lg italic opacity-80">Click to play</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
