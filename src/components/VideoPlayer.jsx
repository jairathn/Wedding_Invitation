import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(true); // Assume video exists, will handle error if not
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const handleExpandClick = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleError = () => {
    setHasVideo(false);
  };

  // ESC key to close fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
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
      {/* Thumbnail/Preview - only show when not fullscreen */}
      {!isFullscreen && (
        <div
          className="relative aspect-video overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #3D4A5C 0%, #2C3542 100%)',
          }}
        >
          {/* Placeholder when no video */}
          {!hasVideo ? (
            <>
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

              {/* Expand button - for testing even without video */}
              <motion.button
                className="absolute bottom-3 right-3 z-[100] w-9 h-9 rounded bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
                onClick={handleExpandClick}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </motion.button>
            </>
          ) : (
            <>
              {/* Video element */}
              <video
                className="w-full h-full"
                controls
                playsInline
                onError={handleError}
                onEnded={() => {
                  setIsPlaying(false);
                  window.dispatchEvent(new Event('video-ended'));
                }}
                onPause={() => {
                  setIsPlaying(false);
                  window.dispatchEvent(new Event('video-pause'));
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  window.dispatchEvent(new Event('video-play'));
                }}
              >
                <source src="/video/Invitation_Video.mp4" type="video/mp4" />
              </video>

              {/* Expand button - bottom right */}
              <motion.button
                className="absolute bottom-3 right-3 z-[100] w-9 h-9 rounded bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
                onClick={handleExpandClick}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </motion.button>
            </>
          )}
        </div>
      )}

      {/* Fullscreen Modal - rendered via Portal to escape card constraints */}
      {typeof document !== 'undefined' && createPortal(
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
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

              {/* Video container - centered, 16:9, fills most of screen */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative group"
                  style={{
                    width: 'min(90vw, calc(90vh * 16 / 9))',
                    height: 'min(90vh, calc(90vw * 9 / 16))',
                  }}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    playsInline
                    onError={handleError}
                    onEnded={() => {
                      setIsPlaying(false);
                      window.dispatchEvent(new Event('video-ended'));
                    }}
                    onPause={() => {
                      setIsPlaying(false);
                      window.dispatchEvent(new Event('video-pause'));
                    }}
                    onPlay={() => {
                      setIsPlaying(true);
                      window.dispatchEvent(new Event('video-play'));
                    }}
                  >
                    <source src="/video/Invitation_Video.mp4" type="video/mp4" />
                  </video>

                  {/* Collapse button - bottom right */}
                  <motion.button
                    className="absolute bottom-3 right-3 z-[100] w-11 h-11 rounded bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    onClick={handleExpandClick}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
