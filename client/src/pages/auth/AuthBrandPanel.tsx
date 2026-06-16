import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';
import { LoginBackdrop } from '@/pages/Login/LoginBackdrop';
import { TextReveal } from '@/pages/Login/TextReveal';
import '@/pages/Login/Login.css';

interface AuthBrandPanelProps {
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
}

/** Left brand panel shared by the secondary auth screens (reset / verify). */
export const AuthBrandPanel = ({ eyebrow, title, accent, lede }: AuthBrandPanelProps) => (
  <motion.aside
    className="ss-login__panel ss-login__panel--brand"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
  >
    <LoginBackdrop />

    <motion.div
      className="ss-login__brand-content"
      variants={stagger(0.08, 0.2)}
      initial="hidden"
      animate="visible"
    >
      <motion.span variants={fadeUp} className="eyebrow ss-login__eyebrow">
        {eyebrow}
      </motion.span>

      <h1 className="display ss-login__headline">
        <TextReveal text={title} delay={0.35} />
        <span className="ss-login__headline-accent">
          <TextReveal text={accent} delay={0.85} />
        </span>
      </h1>

      <motion.p variants={fadeUp} className="ss-login__lede">
        {lede}
      </motion.p>
    </motion.div>
  </motion.aside>
);
