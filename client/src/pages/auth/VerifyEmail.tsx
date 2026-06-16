import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { transitions } from '@/lib/motion';
import { AuthBrandPanel } from './AuthBrandPanel';
import './Auth.css';

interface VerifyState {
  email?: string;
}

const RESEND_COOLDOWN = 30;

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, markEmailVerified, logout } = useAuth();
  const { notify } = useToast();

  const email = (location.state as VerifyState | null)?.email ?? user?.email ?? 'your email';

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    notify({
      tone: 'info',
      title: 'Verification email sent',
      description: `We've re-sent the link to ${email}.`,
    });
  };

  const confirm = () => {
    markEmailVerified();
    notify({ tone: 'success', title: 'Email verified', description: 'Welcome to ServeSense.' });
    window.setTimeout(() => navigate('/dashboard', { replace: true }), 200);
  };

  return (
    <div className="ss-login">
      <AuthBrandPanel
        eyebrow="ServeSense · Get started"
        title="One last step —"
        accent="confirm it's you."
        lede="Verifying your email keeps your restaurant's data secure and lets us reach you about your account."
      />

      <motion.section
        className="ss-login__panel ss-login__panel--form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.softSpring, delay: 0.15 }}
      >
        <motion.div
          className="ss-login__form ss-auth__inner ss-auth__sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.base}
        >
          <div className="ss-login__logo-mark" aria-hidden="true">
            <span>S</span>
          </div>

          <div className="ss-auth__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <header className="ss-login__form-header">
            <h2>Verify your email</h2>
            <p>
              We've sent a verification link to <strong>{email}</strong>. Click it to activate your
              account.
            </p>
          </header>

          <div className="ss-auth__actions">
            {/* Design preview: stand-in for clicking the emailed link. */}
            <Button variant="primary" size="lg" fullWidth onClick={confirm}>
              I've verified — continue
            </Button>
            <button
              type="button"
              className="ss-auth__text-btn"
              onClick={resend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend email in ${cooldown}s` : "Didn't get it? Resend email"}
            </button>
          </div>

          <small className="ss-login__help">
            Wrong account?{' '}
            <Link to="/login" className="text-link" onClick={() => logout()}>
              Sign out
            </Link>
          </small>

          <div className="ss-login__hint">
            <span className="ss-login__hint-dot" aria-hidden="true" />
            Design preview — no real email is sent; use "I've verified" to continue.
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default VerifyEmailPage;
