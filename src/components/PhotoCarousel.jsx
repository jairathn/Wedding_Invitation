import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function PhotoCarousel({ show }) {
  const [topPhotos] = useState(
    Array.from({ length: 15 }, (_, i) => `/images/top-${i + 1}.jpg`)
  );
  const [bottomPhotos] = useState(
    Array.from({ length: 15 }, (_, i) => `/images/bottom-${i + 1}.jpg`)
  );

  // Duplicate photos for seamless loop
  const topPhotosLoop = [...topPhotos, ...topPhotos, ...topPhotos];
  const bottomPhotosLoop = [...bottomPhotos, ...bottomPhotos, ...bottomPhotos];

  return (
    <motion.div
      className="fixed inset-0 z-[2] pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      {/* Top carousel - moves left */}
      <div className="absolute top-0 left-0 right-0 h-32 md:h-40 overflow-hidden">
        <motion.div
          className="flex gap-4 h-full"
          animate={{
            x: [0, -1920], // Adjust based on total width
          }}
          transition={{
            x: {
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {topPhotosLoop.map((photo, index) => (
            <div
              key={`top-${index}`}
              className="h-full flex-shrink-0 opacity-30"
            >
              <img
                src={photo}
                alt=""
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom carousel - moves right */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 overflow-hidden">
        <motion.div
          className="flex gap-4 h-full"
          animate={{
            x: [-1920, 0], // Opposite direction
          }}
          transition={{
            x: {
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {bottomPhotosLoop.map((photo, index) => (
            <div
              key={`bottom-${index}`}
              className="h-full flex-shrink-0 opacity-30"
            >
              <img
                src={photo}
                alt=""
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
