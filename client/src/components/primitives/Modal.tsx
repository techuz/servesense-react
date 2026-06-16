import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { easing, transitions } from '@/lib/motion';
import './Modal.css';

interface ModalProps {
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

/**
 * Centered dialog. Mirrors Drawer's portal + overlay + ESC + scroll-lock
 * conventions, but scales in from center instead of sliding from the edge.
 * Use for short confirmations / success states; use Drawer for forms.
 */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  size = 'sm',
  children,
  footer,
  forceful = false,
}: ModalProps) => {
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
        <div className="ss-modal-root">
          <motion.div
            key="overlay"
            className="ss-modal__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easing.out }}
            onClick={forceful ? undefined : onClose}
          />
          <div className="ss-modal__centerer">
            <motion.div
              key="panel"
              className={`ss-modal ss-modal--${size}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'ss-modal-title' : undefined}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={transitions.softSpring}
              onClick={(e) => e.stopPropagation()}
            >
              {!forceful && (
                <button
                  type="button"
                  className="ss-modal__close"
                  onClick={onClose}
                  aria-label="Close dialog"
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

              {(title || description) && (
                <header className="ss-modal__header">
                  {title && (
                    <h2 id="ss-modal-title" className="ss-modal__title">
                      {title}
                    </h2>
                  )}
                  {description && <p className="ss-modal__desc">{description}</p>}
                </header>
              )}

              <div className="ss-modal__body">{children}</div>

              {footer && <footer className="ss-modal__footer">{footer}</footer>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
