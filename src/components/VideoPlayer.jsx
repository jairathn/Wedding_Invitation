import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(true); // Assume video exists, will handle error if not
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsFullscreen(false);
    setIsPlaying(false);
  };

  const handleVideoLoaded = () => {
    // Auto-play when video is loaded in fullscreen
    if (videoRef.current && isFullscreen) {
      videoRef.current.play().catch((error) => {
        console.log('Auto-play prevented:', error);
      });
    }
  };

  const handleError = () => {
    setHasVideo(false);
  };

  // ESC key to close fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleCloseFullscreen();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  return (
    <>
      {/* Thumbnail/Preview */}
      <div
        className="relative aspect-video overflow-hidden cursor-pointer"
        onClick={handlePlayClick}
        style={{
          background: 'linear-gradient(135deg, #3D4A5C 0%, #2C3542 100%)',
        }}
      >
        {/* Placeholder when no video */}
        {!hasVideo ? (
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
        ) : (
          /* Play button overlay */
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

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dimmed background overlay */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseFullscreen}
            />

            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-warm-white/10 hover:bg-warm-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
              onClick={handleCloseFullscreen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 text-warm-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Video player - fills entire screen */}
            <motion.video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              controls
              playsInline
              autoPlay
              onLoadedData={handleVideoLoaded}
              onError={handleError}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <source src="/video/Invitation_Video.mp4" type="video/mp4" />
            </motion.video>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
