import { useRef, useEffect, useState } from 'react';
import Player from '@vimeo/player';

export function VideoPlayer({ isFlipped = false }) {
  // Vimeo video ID from https://vimeo.com/1149072071
  const VIMEO_VIDEO_ID = '1149072071';

  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [showButton, setShowButton] = useState(true);

  const handleFullscreen = () => {
    if (playerRef.current) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    }
  };

  // Initialize Vimeo Player and set up event listeners for music coordination
  useEffect(() => {
    if (!VIMEO_VIDEO_ID || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    // Ensure controls are visible when the player is ready
    player.ready().then(() => {
      // Show controls immediately so users can see the fullscreen button
      player.enableTextTrack('en').catch(() => {}); // Trigger player interaction to show controls
    });

    // Listen to Vimeo player events and dispatch custom events for BackgroundMusic component
    player.on('play', () => {
      window.dispatchEvent(new Event('video-play'));
    });

    player.on('pause', () => {
      window.dispatchEvent(new Event('video-pause'));
    });

    player.on('ended', () => {
      window.dispatchEvent(new Event('video-ended'));
    });

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [VIMEO_VIDEO_ID]);

  // Show placeholder if no video ID is configured
  if (!VIMEO_VIDEO_ID) {
    return (
      <div
        className="relative aspect-video overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #3D4A5C 0%, #2C3542 100%)',
        }}
      >
        {/* Decorative play icon */}
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
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden group">
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?title=0&byline=0&portrait=0&controls=1&transparent=0`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Wedding Video"
      />

      {/* Custom fullscreen button - always visible on mobile, shows on hover on desktop */}
      {showButton && !isFlipped && (
        <button
          onClick={handleFullscreen}
          className="absolute bottom-3 right-3 z-50 w-10 h-10 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Fullscreen"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
