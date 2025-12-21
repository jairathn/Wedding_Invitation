import { motion } from 'framer-motion';

export function WaxSeal({ onClick, isVisible = true }) {
  return (
    <motion.button
      onClick={onClick}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none z-20"
      style={{
        width: '85px',
        height: '85px',
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Seal base shadow - sits on envelope */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2"
        style={{
          width: '90%',
          height: '12px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />

      {/* Main seal body with 3D effect */}
      <div className="relative w-full h-full">
        {/* Outer glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 26, 26, 0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Wax seal - layered for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(220, 60, 50, 0.9) 0%, transparent 50%),
              radial-gradient(circle at 70% 40%, rgba(180, 30, 30, 0.4) 0%, transparent 40%),
              radial-gradient(ellipse at center, #A52A2A 0%, #8B1A1A 50%, #6B0F0F 100%)
            `,
            boxShadow: `
              inset 0 2px 8px rgba(255, 255, 255, 0.25),
              inset 0 -3px 12px rgba(0, 0, 0, 0.5),
              0 4px 12px rgba(0, 0, 0, 0.4),
              0 8px 24px rgba(139, 26, 26, 0.3)
            `,
          }}
        >
          {/* Glossy highlight */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6) 0%, transparent 50%)',
            }}
          />

          {/* Irregular edge effect - organic wax */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
              clipPath: `polygon(
                50% 0%, 55% 2%, 60% 1%, 65% 3%, 70% 2%, 75% 4%, 80% 3%, 85% 5%, 90% 4%, 95% 6%,
                98% 10%, 99% 15%, 100% 20%, 100% 25%, 99% 30%, 100% 35%, 100% 40%, 99% 45%, 100% 50%,
                99% 55%, 100% 60%, 100% 65%, 99% 70%, 98% 75%, 96% 80%, 94% 85%, 90% 88%, 85% 91%,
                80% 93%, 75% 95%, 70% 96%, 65% 97%, 60% 98%, 55% 99%, 50% 100%, 45% 99%, 40% 98%,
                35% 97%, 30% 96%, 25% 95%, 20% 93%, 15% 91%, 10% 88%, 6% 85%, 4% 80%, 2% 75%,
                1% 70%, 0% 65%, 0% 60%, 1% 55%, 0% 50%, 1% 45%, 0% 40%, 0% 35%, 1% 30%, 0% 25%,
                0% 20%, 1% 15%, 2% 10%, 5% 6%, 10% 4%, 15% 3%, 20% 2%, 25% 1%, 30% 1%, 35% 0%,
                40% 1%, 45% 0%
              )`,
            }}
          />
        </div>

        {/* Drip marks at base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
          {/* Left drip */}
          <div
            className="relative"
            style={{
              width: '8px',
              height: '12px',
              background: 'linear-gradient(180deg, #8B1A1A 0%, #6B0F0F 100%)',
              borderRadius: '0 0 4px 4px',
              transform: 'translateX(-15px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          {/* Center drip */}
          <div
            className="relative"
            style={{
              width: '6px',
              height: '8px',
              background: 'linear-gradient(180deg, #8B1A1A 0%, #6B0F0F 100%)',
              borderRadius: '0 0 3px 3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          {/* Right drip */}
          <div
            className="relative"
            style={{
              width: '7px',
              height: '10px',
              background: 'linear-gradient(180deg, #8B1A1A 0%, #6B0F0F 100%)',
              borderRadius: '0 0 3.5px 3.5px',
              transform: 'translateX(12px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Embossed text content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* S&N - larger, embossed */}
          <div
            className="font-serif text-2xl font-bold tracking-wider mb-1"
            style={{
              color: '#5A0000',
              textShadow: `
                0 1px 0 rgba(255,255,255,0.2),
                0 -1px 0 rgba(0,0,0,0.5),
                0 2px 3px rgba(0,0,0,0.3)
              `,
              transform: 'translateZ(5px)',
            }}
          >
            S&N
          </div>

          {/* Click to open - smaller, subtle */}
          <motion.div
            className="font-sans text-[9px] tracking-wide uppercase"
            style={{
              color: '#7A0F0F',
              textShadow: `
                0 1px 0 rgba(255,255,255,0.15),
                0 -1px 0 rgba(0,0,0,0.4)
              `,
            }}
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            Click to open
          </motion.div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.button>
  );
}
