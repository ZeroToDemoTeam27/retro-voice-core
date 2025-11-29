import { motion } from 'framer-motion';

export const CRTOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-30" />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.7) 100%)'
        }}
      />
      
      {/* Flicker effect */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: [0, 0.03, 0, 0.02, 0] }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'linear'
        }}
      />
    </div>
  );
};
