import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { AuthBrandPanel } from './AuthBrandPanel';
import './Auth.css';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const { notify } = useToast();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const error = touched && !emailRe.test(email.trim()) ? 'Enter a valid email' : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailRe.test(email.trim())) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Could not send the reset link.';
      notify({ tone: 'error', title: 'Something went wrong', description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ss-login">
      <AuthBrandPanel
        eyebrow="ServeSense · Account"
        title="Locked out?"
        accent="We'll get you back in."
        lede="Enter the email on your manager account and we'll send a secure link to reset your password."
      />

      <motion.section
        className="ss-login__panel ss-login__panel--form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.softSpring, delay: 0.15 }}
      >
        <div className={cn('ss-login__form', sent && 'ss-login__form--center')}>
          <div className="ss-login__logo-mark" aria-hidden="true">
            <span>S</span>
          </div>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                variants={stagger(0.07, 0.1)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8 }}
                noValidate
                className="ss-auth__inner"
              >
                <motion.header variants={fadeUp} className="ss-login__form-header">
                  <h2>Reset your password</h2>
                  <p>We'll email you a link to set a new one.</p>
                </motion.header>

                <motion.div variants={fadeUp}>
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="manager@yourrestaurant.com"
                    error={error}
                    required
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    disabled={submitting}
                  >
                    Send reset link
                  </Button>
                </motion.div>

                <motion.small variants={fadeUp} className="ss-login__help">
                  Remembered it? <Link to="/login" className="text-link">Back to sign in</Link>
                </motion.small>
              </motion.form>
            ) : (
              <motion.div
                key="sent"
                className="ss-auth__inner ss-auth__sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.base}
              >
                <div className="ss-auth__icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <header className="ss-login__form-header">
                  <h2>Check your inbox</h2>
                  <p>
                    If an account exists for <strong>{email.trim()}</strong>, a reset link is on its
                    way. The link expires in 30 minutes.
                  </p>
                </header>

                <div className="ss-auth__actions">
                  {/* In design preview the link routes straight to the reset screen. */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/reset-password')}
                  >
                    Open reset link
                  </Button>
                  <button
                    type="button"
                    className="ss-auth__text-btn"
                    onClick={() => {
                      setSent(false);
                      notify({ tone: 'info', title: 'Try a different email', description: 'Enter the address again.' });
                    }}
                  >
                    Use a different email
                  </button>
                </div>

                <small className="ss-login__help">
                  <Link to="/login" className="text-link">Back to sign in</Link>
                </small>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ss-login__hint">
            <span className="ss-login__hint-dot" aria-hidden="true" />
            Design preview — no real email is sent; use "Open reset link" to continue.
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ForgotPasswordPage;
