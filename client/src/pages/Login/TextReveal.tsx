import { motion } from 'framer-motion';
import { easing } from '@/lib/motion';

interface TextRevealProps {
  text: string;
  delay?: number;
  stagger?: number;
}

/**
 * Reveals text word-by-word with a clip-path slide-up. Each word lives in its
 * own overflow-hidden span so the motion is contained and crisp.
 */
export const TextReveal = ({ text, delay = 0, stagger = 0.08 }: TextRevealProps) => {
  const words = text.split(' ');

  return (
    <span className="ss-text-reveal" aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="ss-text-reveal__mask" aria-hidden="true">
          <motion.span
            className="ss-text-reveal__word"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.7,
              ease: easing.soft,
              delay: delay + i * stagger,
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
