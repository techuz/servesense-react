import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { PhoneField } from '@/components/primitives/PhoneField';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { LoginBackdrop } from '@/pages/Login/LoginBackdrop';
import { TextReveal } from '@/pages/Login/TextReveal';
import {
  hasErrors,
  validateAll,
  type SignUpErrors,
  type SignUpField,
  type SignUpValues,
} from './validate';
import '@/pages/Login/Login.css';
import './SignUp.css';

const emptyValues: SignUpValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  restaurantName: '',
  restaurantAddress: '',
};

type TouchedState = Partial<Record<SignUpField, boolean>>;

const stepFields: Record<1 | 2, SignUpField[]> = {
  1: ['fullName', 'email', 'phone', 'password', 'confirmPassword'],
  2: ['restaurantName', 'restaurantAddress'],
};

const steps = [
  { n: 1, label: 'About you', hint: 'Your manager login' },
  { n: 2, label: 'Your restaurant', hint: 'Name & location' },
] as const;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notify } = useToast();

  const [values, setValues] = useState<SignUpValues>(emptyValues);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);

  const liveErrors: SignUpErrors = useMemo(() => validateAll(values), [values]);

  const set = (field: SignUpField) => (value: string) =>
    setValues((v) => ({ ...v, [field]: value }));
  const blur = (field: SignUpField) => () => setTouched((t) => ({ ...t, [field]: true }));
  const err = (field: SignUpField) => (touched[field] ? liveErrors[field] : undefined);

  const stepInvalid = (s: 1 | 2) => stepFields[s].some((f) => liveErrors[f]);

  const goNext = () => {
    setTouched((t) => ({ ...t, fullName: true, email: true, phone: true, password: true, confirmPassword: true }));
    if (stepInvalid(1)) {
      notify({ tone: 'error', title: 'Check the highlighted fields', description: 'Fix these before continuing.' });
      return;
    }
    setDirection(1);
    setStep(2);
  };

  const goBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, restaurantName: true, restaurantAddress: true }));

    if (hasErrors(liveErrors)) {
      // Bounce back to whichever step has the problem.
      if (stepInvalid(1)) {
        setDirection(-1);
        setStep(1);
      }
      notify({ tone: 'error', title: 'Almost there', description: 'A couple of details still need a fix.' });
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        restaurantName: values.restaurantName,
        restaurantAddress: values.restaurantAddress,
      });
      notify({ tone: 'success', title: 'Account created', description: 'Just verify your email to finish setting up.' });
      window.setTimeout(
        () => navigate('/verify-email', { replace: true, state: { email: values.email.trim() } }),
        280,
      );
    } catch (e2) {
      const message = (e2 as { message?: string })?.message ?? 'Could not create your account. Please try again.';
      notify({ tone: 'error', title: 'Sign-up failed', description: message });
      setSubmitting(false);
    }
  };

  const slide = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
  };

  return (
    <div className="ss-login ss-signup">
      <motion.aside
        className="ss-login__panel ss-login__panel--brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <LoginBackdrop />

        <motion.div className="ss-login__brand-content" variants={stagger(0.08, 0.2)} initial="hidden" animate="visible">
          <motion.span variants={fadeUp} className="eyebrow ss-login__eyebrow">
            ServeSense · Get started
          </motion.span>

          <h1 className="display ss-login__headline">
            <TextReveal text="Set the standard," delay={0.35} />
            <span className="ss-login__headline-accent">
              <TextReveal text="from the very first table." delay={0.85} />
            </span>
          </h1>

          <motion.p variants={fadeUp} className="ss-login__lede">
            Create your restaurant account in under a minute. Upload your menu, define your service
            standards, and bring your team onto ServeSense.
          </motion.p>

          {/* Step rail — reflects progress through the two steps */}
          <motion.ol className="ss-signup__rail" variants={stagger(0.12, 1.1)} initial="hidden" animate="visible">
            {steps.map((s) => (
              <motion.li
                key={s.n}
                variants={fadeUp}
                className={cn(
                  'ss-signup__rail-item',
                  step === s.n && 'ss-signup__rail-item--active',
                  step > s.n && 'ss-signup__rail-item--done',
                )}
              >
                <span className="ss-signup__rail-num">
                  {step > s.n ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M2.5 7l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    `0${s.n}`
                  )}
                </span>
                <span className="ss-signup__rail-text">
                  <strong>{s.label}</strong>
                  <small>{s.hint}</small>
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </motion.aside>

      <motion.section
        className="ss-login__panel ss-login__panel--form ss-signup__panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.softSpring, delay: 0.15 }}
      >
        <form className="ss-login__form ss-signup__form" onSubmit={handleSubmit} noValidate>
          <div className="ss-login__logo-mark" aria-hidden="true">
            <span>S</span>
          </div>

          {/* Progress bar */}
          <div className="ss-signup__progress" aria-hidden="true">
            <div className="ss-signup__progress-track">
              <motion.div
                className="ss-signup__progress-fill"
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={transitions.softSpring}
              />
            </div>
            <span className="ss-signup__progress-label">Step {step} of 2</span>
          </div>

          <header className="ss-signup__header">
            <h2>{step === 1 ? 'Create your account' : 'Tell us about your restaurant'}</h2>
            <p>{step === 1 ? 'This is your manager login.' : 'You can refine all of this later.'}</p>
          </header>

          <div className="ss-signup__steps">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  className="ss-signup__step"
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transitions.base}
                >
                  <Input
                    label="Full name"
                    value={values.fullName}
                    onChange={(e) => set('fullName')(e.target.value)}
                    onBlur={blur('fullName')}
                    placeholder="Alex Rivera"
                    error={err('fullName')}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => set('email')(e.target.value)}
                    onBlur={blur('email')}
                    placeholder="alex@yourrestaurant.com"
                    error={err('email')}
                    required
                  />
                  <PhoneField
                    label="Phone"
                    id="signup-phone"
                    value={values.phone}
                    onChange={set('phone')}
                    onBlur={blur('phone')}
                    error={err('phone')}
                    hint="We may text setup tips — standard rates apply."
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(e) => set('password')(e.target.value)}
                    onBlur={blur('password')}
                    placeholder="At least 8 characters"
                    hint={!err('password') ? 'Use 8+ characters with an uppercase letter, a number, and a symbol.' : undefined}
                    error={err('password')}
                    required
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={(e) => set('confirmPassword')(e.target.value)}
                    onBlur={blur('confirmPassword')}
                    placeholder="Re-enter your password"
                    error={err('confirmPassword')}
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  className="ss-signup__step"
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transitions.base}
                >
                  <Input
                    label="Restaurant name"
                    value={values.restaurantName}
                    onChange={(e) => set('restaurantName')(e.target.value)}
                    onBlur={blur('restaurantName')}
                    placeholder="Brasa Spanish Kitchen"
                    error={err('restaurantName')}
                    required
                  />
                  <Textarea
                    label="Restaurant address"
                    value={values.restaurantAddress}
                    onChange={(e) => set('restaurantAddress')(e.target.value)}
                    onBlur={blur('restaurantAddress')}
                    placeholder="128 Bleecker Street, New York, NY 10012"
                    rows={3}
                    hint={!err('restaurantAddress') ? 'Optional — you can add this later.' : undefined}
                    error={err('restaurantAddress')}
                  />

                  <div className="ss-signup__summary">
                    <div className="ss-signup__summary-row">
                      <span>Account</span>
                      <strong>{values.fullName || '—'}</strong>
                    </div>
                    <div className="ss-signup__summary-row">
                      <span>Email</span>
                      <strong>{values.email || '—'}</strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer actions */}
          <div className="ss-signup__actions">
            {step === 2 && (
              <Button type="button" variant="ghost" size="lg" onClick={goBack}>
                ← Back
              </Button>
            )}
            {step === 1 ? (
              <Button type="button" variant="primary" size="lg" fullWidth onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={submitting}>
                Create account
              </Button>
            )}
          </div>

          <small className="ss-login__help">
            Already have an account? <Link to="/login" className="text-link">Sign in</Link>
          </small>

          <div className="ss-login__hint">
            <span className="ss-login__hint-dot" aria-hidden="true" />
            Design preview — submitting creates a local mock account and signs you in.
          </div>
        </form>
      </motion.section>
    </div>
  );
};

export default SignUpPage;
