import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';

export function OpenedInvitation({ guestName }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* 3D Trifold Container */}
        <div className="relative flex justify-center items-stretch">

          {/* LEFT PANEL - Trapezoid (shorter edge toward center) */}
          <motion.div
            className="relative flex-shrink-0"
            style={{
              width: '20%',
              minWidth: '160px',
              maxWidth: '220px',
            }}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="h-full relative"
              style={{
                clipPath: 'polygon(0 0, 100% 8%, 100% 92%, 0 100%)',
                background: 'linear-gradient(135deg, #FFFEF9 0%, #F5F0E8 100%)',
                boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Paper texture */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center px-6 py-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <p className="font-serif text-xl md:text-2xl text-charcoal italic mb-1">
                    Welcome,
                  </p>
                  <p className="font-serif text-2xl md:text-3xl text-terracotta italic mb-8">
                    {guestName}
                  </p>

                  {/* Divider */}
                  <div className="w-12 h-px bg-golden/50 mb-8" />

                  <p className="font-serif text-lg md:text-xl text-charcoal italic mb-3">
                    Shriya & Neil
                  </p>
                  <p className="font-sans text-xs text-charcoal-light leading-relaxed">
                    joyfully request the pleasure<br />
                    of your company at their<br />
                    wedding celebration
                  </p>
                </motion.div>
              </div>

              {/* Fold shadow on right edge */}
              <div
                className="absolute top-0 right-0 w-3 h-full"
                style={{
                  background: 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)',
                }}
              />
            </div>
          </motion.div>

          {/* CENTER PANEL - Rectangle (wider for video) */}
          <motion.div
            className="relative flex-grow"
            style={{
              maxWidth: '600px',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="h-full relative"
              style={{
                background: 'linear-gradient(180deg, #FFFEF9 0%, #FAF7F2 100%)',
              }}
            >
              {/* Paper texture */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Top gold line */}
              <div className="h-px bg-gradient-to-r from-golden/30 via-golden to-golden/30" />

              {/* Content */}
              <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col items-center justify-center min-h-[500px]">
                <motion.div
                  className="w-full max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {/* Video label */}
                  <p className="font-sans text-xs text-charcoal-light tracking-[0.2em] uppercase text-center mb-6">
                    Our Story
                  </p>

                  {/* Video Player - 16:9 with margins */}
                  <div className="relative">
                    <div className="absolute -inset-2 border border-golden/20" />
                    <VideoPlayer />
                  </div>
                </motion.div>
              </div>

              {/* Bottom gold line */}
              <div className="h-px bg-gradient-to-r from-golden/30 via-golden to-golden/30" />
            </div>
          </motion.div>

          {/* RIGHT PANEL - Trapezoid (shorter edge toward center) */}
          <motion.div
            className="relative flex-shrink-0"
            style={{
              width: '20%',
              minWidth: '160px',
              maxWidth: '220px',
            }}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="h-full relative"
              style={{
                clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 92%)',
                background: 'linear-gradient(225deg, #FFFEF9 0%, #F5F0E8 100%)',
                boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Paper texture */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center px-6 py-12 text-right">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {/* Hashtag */}
                  <p className="font-serif text-xl md:text-2xl text-golden italic mb-8">
                    #JayWalkingToJairath
                  </p>

                  {/* Divider */}
                  <div className="w-12 h-px bg-golden/50 mb-8 ml-auto" />

                  {/* Location & Date */}
                  <p className="font-sans text-xs text-charcoal-light tracking-[0.2em] uppercase mb-2">
                    Barcelona, Spain
                  </p>
                  <p className="font-serif text-lg md:text-xl text-charcoal italic mb-10">
                    September 9 – 11, 2026
                  </p>

                  {/* RSVP */}
                  <div className="flex justify-end">
                    <RSVPButton />
                  </div>
                </motion.div>
              </div>

              {/* Fold shadow on left edge */}
              <div
                className="absolute top-0 left-0 w-3 h-full"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Shadow underneath the trifold */}
        <div
          className="mx-auto mt-2"
          style={{
            width: '80%',
            height: '20px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
