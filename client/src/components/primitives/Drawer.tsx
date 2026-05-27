import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { easing } from '@/lib/motion';
import './Drawer.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
  /** Hide the close button & disable click-outside. Useful for required steps. */
  forceful?: boolean;
}

export const Drawer = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  forceful = false,
}: DrawerProps) => {
  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !forceful) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, forceful]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="ss-drawer-root">
          <motion.div
            key="overlay"
            className="ss-drawer__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easing.out }}
            onClick={forceful ? undefined : onClose}
          />
          <motion.aside
            key="panel"
            className={`ss-drawer ss-drawer--${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'ss-drawer-title' : undefined}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
          >
            {(title || !forceful) && (
              <header className="ss-drawer__header">
                <div>
                  {title && (
                    <h2 id="ss-drawer-title" className="ss-drawer__title">
                      {title}
                    </h2>
                  )}
                  {description && <p className="ss-drawer__desc">{description}</p>}
                </div>
                {!forceful && (
                  <button
                    type="button"
                    className="ss-drawer__close"
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path
                        d="M3 3l10 10M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </header>
            )}

            <div className="ss-drawer__body">{children}</div>

            {footer && <footer className="ss-drawer__footer">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
