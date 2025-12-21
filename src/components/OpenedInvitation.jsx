import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { RSVPButton } from './RSVPButton';
import { PaperTexture } from './PaperTexture';

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
        <div className="relative flex justify-center items-stretch" style={{ minHeight: '70vh' }}>

          {/* LEFT PANEL - Trapezoid */}
          <motion.div
            className="relative"
            style={{
              width: '22%',
              minWidth: '200px',
              maxWidth: '280px',
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Trapezoid shape using SVG clip */}
            <div
              className="h-full relative overflow-hidden"
              style={{
                clipPath: 'polygon(0 0, 100% 5%, 100% 95%, 0 100%)',
              }}
            >
              {/* Paper texture */}
              <PaperTexture />

              {/* Fold shadow on right edge */}
              <div
                className="absolute top-0 right-0 w-6 h-full z-10"
                style={{
                  background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)',
                }}
              />

              {/* Content - vertically distributed */}
              <div className="relative h-full flex flex-col justify-between py-12 px-6 md:px-8">
                {/* Top section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <p className="font-serif text-xl md:text-2xl text-charcoal italic mb-1">
                    Welcome,
                  </p>
                  <p className="font-serif text-2xl md:text-3xl text-terracotta italic">
                    {guestName}
                  </p>
                </motion.div>

                {/* Middle section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {/* Divider */}
                  <div className="w-16 h-px bg-golden/40 mb-6" />

                  <p className="font-serif text-xl md:text-2xl text-charcoal italic mb-4">
                    Shriya & Neil
                  </p>
                  <p className="font-sans text-sm text-charcoal-light leading-relaxed">
                    joyfully request the pleasure
                    of your company at their
                    wedding celebration
                  </p>
                </motion.div>

                {/* Bottom section - decorative */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="w-12 h-px bg-golden/30" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CENTER PANEL - Rectangle */}
          <motion.div
            className="relative flex-grow"
            style={{
              maxWidth: '550px',
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="h-full relative overflow-hidden rounded-sm">
              {/* Paper texture */}
              <PaperTexture />

              {/* Top gold line */}
              <div className="relative h-px bg-gradient-to-r from-golden/40 via-golden/70 to-golden/40" />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center px-8 py-12 md:px-12 md:py-16">
                <motion.div
                  className="w-full max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {/* Video label */}
                  <p className="font-sans text-xs text-charcoal-light tracking-[0.2em] uppercase text-center mb-5">
                    Our Story
                  </p>

                  {/* Video Player with frame */}
                  <div className="relative">
                    <div className="absolute -inset-2 border border-golden/25 rounded-md" />
                    <div className="rounded-sm overflow-hidden">
                      <VideoPlayer />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom gold line */}
              <div className="relative h-px bg-gradient-to-r from-golden/40 via-golden/70 to-golden/40" />
            </div>
          </motion.div>

          {/* RIGHT PANEL - Trapezoid */}
          <motion.div
            className="relative"
            style={{
              width: '22%',
              minWidth: '200px',
              maxWidth: '280px',
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Trapezoid shape */}
            <div
              className="h-full relative overflow-hidden"
              style={{
                clipPath: 'polygon(0 5%, 100% 0, 100% 100%, 0 95%)',
              }}
            >
              {/* Paper texture */}
              <PaperTexture />

              {/* Fold shadow on left edge */}
              <div
                className="absolute top-0 left-0 w-6 h-full z-10"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.12), transparent)',
                }}
              />

              {/* Content - vertically distributed */}
              <div className="relative h-full flex flex-col justify-between py-12 px-6 md:px-8 text-right">
                {/* Top section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <p className="font-serif text-xl md:text-2xl text-golden italic">
                    #JayWalkingToJairath
                  </p>
                </motion.div>

                {/* Middle section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {/* Divider */}
                  <div className="w-16 h-px bg-golden/40 mb-6 ml-auto" />

                  <p className="font-sans text-xs text-charcoal-light tracking-[0.2em] uppercase mb-2">
                    Barcelona, Spain
                  </p>
                  <p className="font-serif text-xl md:text-2xl text-charcoal italic">
                    September 9 – 11, 2026
                  </p>
                </motion.div>

                {/* Bottom section - RSVP */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {/* Divider */}
                  <div className="w-12 h-px bg-golden/30 mb-6 ml-auto" />

                  <div className="flex justify-end">
                    <RSVPButton />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Shadow underneath the trifold */}
        <div
          className="mx-auto mt-3"
          style={{
            width: '70%',
            height: '25px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
