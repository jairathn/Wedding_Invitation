import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    if (videoRef.current && hasVideo) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setHasVideo(false));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCanPlay = () => {
    setHasVideo(true);
  };

  const handleError = () => {
    setHasVideo(false);
  };

  return (
    <div
      className="relative aspect-video overflow-hidden cursor-pointer"
      onClick={handlePlayClick}
      style={{
        background: 'linear-gradient(135deg, #3D4A5C 0%, #2C3542 100%)',
      }}
    >
      {/* Video element (hidden if no video) */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        preload="metadata"
      >
        <source src="/video/Invitation_Video.mp4" type="video/mp4" />
      </video>

      {/* Placeholder when no video */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Decorative element */}
          <div className="mb-6">
            <svg width="60" height="60" viewBox="0 0 60 60" className="text-warm-white/30">
              <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M24 20 L24 40 L44 30 Z" fill="currentColor" />
            </svg>
          </div>

          <p className="font-serif text-xl text-warm-white/80 italic mb-2">
            Video Coming Soon
          </p>
          <p className="font-sans text-xs text-warm-white/50 tracking-wide">
            Check back for our story
          </p>
        </div>
      )}

      {/* Play button overlay (when video exists but not playing) */}
      {hasVideo && !isPlaying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-charcoal/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-warm-white/90 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6 text-terracotta ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}
