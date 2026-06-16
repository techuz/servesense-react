import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { AuthBrandPanel } from './AuthBrandPanel';
import './Auth.css';

const strong = (p: string) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { notify } = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e: { password?: string; confirm?: string } = {};
    if (!strong(password)) e.password = 'Use 8+ chars with an uppercase letter, a number, and a symbol.';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    return e;
  }, [password, confirm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (errors.password || errors.confirm) return;

    setSubmitting(true);
    try {
      await resetPassword(password);
      notify({
        tone: 'success',
        title: 'Password updated',
        description: 'Sign in with your new password.',
      });
      window.setTimeout(() => navigate('/login', { replace: true }), 320);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Could not reset your password.';
      notify({ tone: 'error', title: 'Reset failed', description: message });
      setSubmitting(false);
    }
  };

  return (
    <div className="ss-login">
      <AuthBrandPanel
        eyebrow="ServeSense · Account"
        title="Almost there —"
        accent="choose a new password."
        lede="Pick something strong and memorable. You'll use it to sign in to your manager workspace from now on."
      />

      <motion.section
        className="ss-login__panel ss-login__panel--form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.softSpring, delay: 0.15 }}
      >
        <motion.form
          className="ss-login__form ss-auth__inner"
          onSubmit={handleSubmit}
          variants={stagger(0.07, 0.1)}
          initial="hidden"
          animate="visible"
          noValidate
        >
          <motion.div variants={fadeUp} className="ss-login__logo-mark" aria-hidden="true">
            <span>S</span>
          </motion.div>

          <motion.header variants={fadeUp} className="ss-login__form-header">
            <h2>Set a new password</h2>
            <p>Make it at least 8 characters.</p>
          </motion.header>

          <motion.div variants={fadeUp}>
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 8 characters"
              hint={!touched.password ? 'Use 8+ characters with an uppercase letter, a number, and a symbol.' : undefined}
              error={touched.password ? errors.password : undefined}
              required
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              placeholder="Re-enter your password"
              error={touched.confirm ? errors.confirm : undefined}
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
              Update password
            </Button>
          </motion.div>

          <motion.small variants={fadeUp} className="ss-login__help">
            <Link to="/login" className="text-link">Back to sign in</Link>
          </motion.small>

          <motion.div variants={fadeUp} className="ss-login__hint">
            <span className="ss-login__hint-dot" aria-hidden="true" />
            Design preview — this simulates Firebase's password-reset flow.
          </motion.div>
        </motion.form>
      </motion.section>
    </div>
  );
};

export default ResetPasswordPage;
