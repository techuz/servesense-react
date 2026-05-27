import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { scaleIn, transitions } from '@/lib/motion';
import './Topbar.css';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/restaurant': 'Restaurant',
  '/staff': 'Staff Management',
  '/orientation/policies': 'Standard Policies',
  '/orientation/menu': 'Menu Knowledge',
  '/orientation/sop': 'Service SOP',
  '/orientation/tone': 'Communication & Tone',
  '/orientation/excellence': 'Best Practices & Excellence',
  '/orientation/goals': 'Sales Goals & Campaigns',
  '/coaching': 'Knowledge & Coaching',
  '/performance': 'Staff Performance',
};

export const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = ROUTE_TITLES[location.pathname] ?? 'ServeSense';

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onEscape);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    notify({ tone: 'info', title: 'Signed out', description: 'See you next service.' });
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const initials = user?.initials ?? 'M';
  const displayName = user?.fullName ?? 'Manager';
  const email = user?.email ?? '';

  return (
    <header className="ss-topbar">
      <div className="ss-topbar__left">
        <AnimatePresence mode="wait">
          <motion.span
            key={title}
            className="ss-topbar__crumb"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={transitions.base}
          >
            {title}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="ss-topbar__right" ref={menuRef}>
        <motion.button
          className={`ss-topbar__profile ${menuOpen ? 'ss-topbar__profile--open' : ''}`}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          onClick={() => setMenuOpen((o) => !o)}
          whileTap={{ scale: 0.97 }}
        >
          <span className="ss-topbar__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="ss-topbar__profile-text">
            <span className="ss-topbar__name">{displayName}</span>
            <span className="ss-topbar__role">Admin</span>
          </span>
          <motion.svg
            className="ss-topbar__chev"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.18 }}
          >
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="ss-topbar__menu"
              role="menu"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformOrigin: 'top right' }}
            >
              <div className="ss-topbar__menu-header">
                <span className="ss-topbar__menu-name">{displayName}</span>
                {email && <span className="ss-topbar__menu-email">{email}</span>}
              </div>
              <div className="ss-topbar__menu-divider" />
              <button
                className="ss-topbar__menu-item"
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  notify({ tone: 'info', title: 'Coming soon', description: 'Profile settings ship with M2.' });
                }}
              >
                Profile settings
              </button>
              <button
                className="ss-topbar__menu-item ss-topbar__menu-item--danger"
                type="button"
                role="menuitem"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
