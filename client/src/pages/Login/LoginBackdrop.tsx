import { motion } from 'framer-motion';

/**
 * Editorial "printed-menu" backdrop for the auth brand panel.
 *
 * Layers, back to front:
 *  - two drifting radial glows (gold + sage) over the dark forest wash
 *  - a giant serif "S" watermark bleeding off the bottom-right
 *  - a fine dot lattice + fractal grain (warm light on linen)
 *  - an embossed gold hairline frame with engraved corner brackets
 *  - a vertical letterspaced wordmark "spine" up the left edge
 *
 * The frame + spine + watermark give every auth screen the feel of an
 * upscale tasting-menu cover rather than a generic SaaS split-screen.
 */
export const LoginBackdrop = () => {
  return (
    <div className="ss-login__backdrop" aria-hidden="true">
      <motion.span
        className="ss-login__blob ss-login__blob--gold"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="ss-login__blob ss-login__blob--green"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{ x: [0, -60, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.92, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <span className="ss-login__watermark">S</span>

      <div className="ss-login__dots" />
      <div className="ss-login__grain" />

      <motion.div
        className="ss-login__frame"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
      />

      <motion.span
        className="ss-login__spine"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        ServeSense
      </motion.span>
    </div>
  );
};
