import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';

export function Envelope({ guestName, isOpen, onOpen }) {
  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      {/* Envelope shadow */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2"
        style={{
          width: '90%',
          height: '30px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Envelope body */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{
          width: '420px',
          height: '300px',
          borderRadius: '4px',
        }}
        onClick={onOpen}
      >
        {/* Envelope paper texture */}
        <PaperTexture />

        {/* Gold liner visible at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '1px solid rgba(212, 168, 83, 0.3)',
            borderRadius: '4px',
          }}
        />

        {/* Inner gold liner peek (at top where flap meets body) */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{
            background: 'linear-gradient(to bottom, rgba(212, 168, 83, 0.4), transparent)',
          }}
        />

        {/* Guest name - elegant script */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="font-serif text-3xl md:text-4xl text-charcoal italic tracking-wide">
              {guestName}
            </p>
          </motion.div>
        </div>

        {/* Subtle inner shadow for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05), inset 0 -2px 10px rgba(0,0,0,0.03)',
          }}
        />
      </div>

      {/* Envelope flap */}
      <motion.div
        className="absolute left-0 right-0 origin-bottom"
        style={{
          top: '-140px',
          height: '150px',
          transformStyle: 'preserve-3d',
        }}
        initial={{ rotateX: 0 }}
        animate={{ rotateX: isOpen ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Flap front (visible when closed) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'polygon(0 100%, 50% 10%, 100% 100%)',
            backfaceVisibility: 'hidden',
          }}
        >
          <PaperTexture />

          {/* Flap shadow/fold line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-4"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.08), transparent)',
            }}
          />

          {/* Gold edge on flap */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: 'polygon(0 100%, 50% 10%, 100% 100%)',
              border: '1px solid rgba(212, 168, 83, 0.25)',
            }}
          />
        </div>

        {/* Flap back (visible when open) - gold liner */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 100%, 50% 10%, 100% 100%)',
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            background: 'linear-gradient(135deg, #E8D5A3 0%, #D4A853 50%, #C9973F 100%)',
          }}
        />
      </motion.div>

      {/* Click prompt */}
      {!isOpen && (
        <motion.p
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-sans text-xs text-charcoal/50 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Click to open
        </motion.p>
      )}
    </div>
  );
}
