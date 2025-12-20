import { motion } from 'framer-motion';

export function Monogram({ size = 'default' }) {
  const sizeClasses = {
    small: 'text-4xl md:text-5xl',
    default: 'text-5xl md:text-7xl',
    large: 'text-6xl md:text-8xl',
  };

  return (
    <motion.div
      className={`font-serif ${sizeClasses[size]} text-terracotta tracking-wider`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <span className="italic font-light">S</span>
      <span className="mx-2 md:mx-4 text-golden font-light">&</span>
      <span className="italic font-light">N</span>
    </motion.div>
  );
}
