import { FormEvent, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { LoginBackdrop } from './LoginBackdrop';
import { TextReveal } from './TextReveal';
import { hasErrors, validateAll, type LoginFieldErrors } from './validate';
import './Login.css';

interface LocationStateFrom {
  from?: { pathname?: string };
}

type TouchedState = { identifier: boolean; password: boolean };

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { notify } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState<TouchedState>({ identifier: false, password: false });

  // Live validation runs every render — but errors only surface for touched
  // fields (or after a submit attempt).
  const liveErrors: LoginFieldErrors = useMemo(
    () => validateAll(identifier, password),
    [identifier, password],
  );

  // What we actually show to the user
  const visibleErrors: LoginFieldErrors = {
    identifier: touched.identifier ? liveErrors.identifier : undefined,
    password: touched.password ? liveErrors.password : undefined,
  };

  const formInvalid = hasErrors(liveErrors);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all touched on submit, so any remaining errors surface.
    setTouched({ identifier: true, password: true });

    if (formInvalid) {
      notify({
        tone: 'error',
        title: 'Check the highlighted fields',
        description: 'A couple of details need a quick fix before we can sign you in.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      notify({
        tone: 'success',
        title: 'Welcome back',
        description: 'Redirecting to your dashboard…',
      });
      const target = ((location.state as LocationStateFrom | null)?.from?.pathname) ?? '/dashboard';
      window.setTimeout(() => navigate(target, { replace: true }), 280);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ?? 'Could not sign in. Please try again.';
      setServerError(message);
      notify({ tone: 'error', title: 'Sign-in failed', description: message });
      setSubmitting(false);
    }
  };

  return (
    <div className="ss-login">
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
            ServeSense · Manager
          </motion.span>

          <h1 className="display ss-login__headline">
            <TextReveal text="Arrive at excellence," delay={0.35} />
            <span className="ss-login__headline-accent">
              <TextReveal text="one table at a time." delay={0.85} />
            </span>
          </h1>

          <motion.p variants={fadeUp} className="ss-login__lede">
            Real-time conversation intelligence and performance management for restaurants. Set
            policies, train staff, and watch every service standard come alive.
          </motion.p>

          <motion.ul
            className="ss-login__highlights"
            variants={stagger(0.12, 1.3)}
            initial="hidden"
            animate="visible"
          >
            <motion.li variants={fadeUp}>
              <span className="ss-login__highlight-num">01</span>
              <span>Live AI coaching during every guest interaction.</span>
            </motion.li>
            <motion.li variants={fadeUp}>
              <span className="ss-login__highlight-num">02</span>
              <span>KPI-driven performance scoring with personalized micro-lessons.</span>
            </motion.li>
            <motion.li variants={fadeUp}>
              <span className="ss-login__highlight-num">03</span>
              <span>ROI, upsell, and tone analytics for every shift.</span>
            </motion.li>
          </motion.ul>
        </motion.div>
      </motion.aside>

      <motion.section
        className="ss-login__panel ss-login__panel--form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.softSpring, delay: 0.15 }}
      >
        <motion.form
          className="ss-login__form"
          onSubmit={handleSubmit}
          variants={stagger(0.07, 0.35)}
          initial="hidden"
          animate="visible"
          noValidate
        >
          <motion.div variants={fadeUp} className="ss-login__logo-mark" aria-hidden="true">
            <span>S</span>
          </motion.div>

          <motion.header variants={fadeUp} className="ss-login__form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your manager workspace.</p>
          </motion.header>

          <motion.div variants={fadeUp}>
            <Input
              label="Email or phone"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (serverError) setServerError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
              placeholder="manager@yourrestaurant.com"
              error={visibleErrors.identifier}
              hint={
                !visibleErrors.identifier
                  ? 'Use the email or phone your super-admin invited.'
                  : undefined
              }
              aria-invalid={!!visibleErrors.identifier}
              required
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (serverError) setServerError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 6 characters"
              error={visibleErrors.password}
              aria-invalid={!!visibleErrors.password}
              required
            />
          </motion.div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="ss-login__form-error"
              role="alert"
            >
              {serverError}
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
            >
              Sign in
            </Button>
          </motion.div>

          <motion.small variants={fadeUp} className="ss-login__help">
            Manager accounts are provisioned by your super-admin. Contact them for access.
          </motion.small>

          <motion.div variants={fadeUp} className="ss-login__hint">
            <span className="ss-login__hint-dot" aria-hidden="true" />
            Design preview — any email + any 6+ char password will sign you in.
          </motion.div>
        </motion.form>
      </motion.section>
    </div>
  );
};

