import { motion } from 'framer-motion';

/**
 * Animated gradient mesh + dotted texture for the login brand panel.
 * Two large radial blobs drift slowly on diagonal paths, creating an
 * atmospheric "warm light through forest" feel without ever distracting.
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
      <div className="ss-login__dots" />
      <div className="ss-login__grain" />
    </div>
  );
};
