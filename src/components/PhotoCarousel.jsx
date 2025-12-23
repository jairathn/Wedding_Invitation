import { motion } from 'framer-motion';

export function PhotoCarousel({ show }) {
  // Top carousel photos (first half - 28 photos)
  const topPhotos = [
    '2Q9A0361.jpg',
    '2Q9A2798.jpg',
    '2Q9A1224.jpg',
    '2Q9A5567.JPG',
    '2Q9A0779.jpg',
    '2Q9A3227.jpg',
    '2Q9A1650.jpg',
    '2Q9A6047.JPG',
    '2Q9A0422.jpg',
    '2Q9A2202.jpg',
    '2Q9A1444.jpg',
    '2Q9A4240-2.jpg',
    '2Q9A0575.jpg',
    '2Q9A1856.jpg',
    '2Q9A3079.jpg',
    '2Q9A5742.JPG',
    '2Q9A1134.jpg',
    '2Q9A2450.jpg',
    '2Q9A6113.JPG',
    '2Q9A0612.jpg',
    '2Q9A1787.jpg',
    '2Q9A4318.jpg',
    '2Q9A2117.jpg',
    '2Q9A6454.JPG',
    '2Q9A1375.jpg',
    '2Q9A2952.jpg',
    '2Q9A5716.JPG',
    '2Q9A1787-2.jpg',
  ].map(name => `/images/${name}`);

  // Bottom carousel photos (second half - 29 photos)
  const bottomPhotos = [
    '2Q9A0558.jpg',
    '2Q9A3286.jpg',
    '2Q9A1544.jpg',
    '2Q9A6175.JPG',
    '2Q9A1214.jpg',
    '2Q9A2463.jpg',
    '2Q9A4395.jpg',
    '2Q9A1693.jpg',
    '2Q9A5956.JPG',
    '2Q9A2048.jpg',
    '2Q9A6608.JPG',
    '2Q9A1281.jpg',
    '2Q9A3008-2.jpg',
    '2Q9A2225.jpg',
    '2Q9A4421.jpg',
    '2Q9A6029.JPG',
    '2Q9A1735.jpg',
    '2Q9A2819.jpg',
    '2Q9A6454-2.JPG',
    '2Q9A1833.jpg',
    '2Q9A3256-2.jpg',
    '2Q9A2235.jpg',
    '2Q9A6622.JPG',
    '2Q9A1972-2.jpg',
    '2Q9A2954.jpg',
    '2Q9A4416.jpg',
    '2Q9A6029-2.JPG',
    '2Q9A2463-2.jpg',
    '2Q9A3329.jpg',
  ].map(name => `/images/${name}`);

  return (
    <motion.div
      className="fixed inset-0 z-[2] pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      {/* Top carousel - moves left with margin from top */}
      <div className="absolute top-6 left-0 right-0 h-32 md:h-40 overflow-hidden">
        <div className="flex gap-4 h-full animate-scroll-left">
          {topPhotos.map((photo, index) => (
            <div
              key={`top-${index}`}
              className="h-full flex-shrink-0 opacity-60"
            >
              <img
                src={photo}
                alt=""
                loading="lazy"
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {topPhotos.map((photo, index) => (
            <div
              key={`top-dup-${index}`}
              className="h-full flex-shrink-0 opacity-60"
              aria-hidden="true"
            >
              <img
                src={photo}
                alt=""
                loading="lazy"
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom carousel - moves right with margin from bottom */}
      <div className="absolute bottom-6 left-0 right-0 h-32 md:h-40 overflow-hidden">
        <div className="flex gap-4 h-full animate-scroll-right">
          {bottomPhotos.map((photo, index) => (
            <div
              key={`bottom-${index}`}
              className="h-full flex-shrink-0 opacity-60"
            >
              <img
                src={photo}
                alt=""
                loading="lazy"
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {bottomPhotos.map((photo, index) => (
            <div
              key={`bottom-dup-${index}`}
              className="h-full flex-shrink-0 opacity-60"
              aria-hidden="true"
            >
              <img
                src={photo}
                alt=""
                loading="lazy"
                className="h-full w-auto object-cover rounded-sm shadow-lg"
                style={{
                  filter: 'brightness(0.9) contrast(1.1)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
