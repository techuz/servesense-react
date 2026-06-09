import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { scaleIn } from '@/lib/motion';
import {
  useNotifications,
  notificationMeta,
  toneColor,
  timeAgo,
  type NotificationType,
} from '@/lib/mock/notifications';
import './NotificationMenu.css';

/* Per-type inline glyph — 16px, drawn on currentColor (tinted by the tile). */
function NotiIcon({ type }: { type: NotificationType }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (type) {
    case 'post_session_scores':
      return (
        <svg {...common}>
          <path d="M2.5 13.5V9M6.5 13.5V4M10.5 13.5V7M14 13.5H2" />
        </svg>
      );
    case 'coaching_assigned':
      return (
        <svg {...common}>
          <path d="M8 2.5 14.5 5.5 8 8.5 1.5 5.5 8 2.5Z" />
          <path d="M4 7v3.2c0 .9 1.8 1.8 4 1.8s4-.9 4-1.8V7" />
        </svg>
      );
    case 'waiter_created':
      return (
        <svg {...common}>
          <circle cx="6" cy="5.5" r="2.5" />
          <path d="M1.5 13.5c0-2.2 2-3.8 4.5-3.8 1 0 1.9.25 2.6.68" />
          <path d="M12 9.5v4M14 11.5h-4" />
        </svg>
      );
    case 'waiter_deactivated':
      return (
        <svg {...common}>
          <circle cx="6" cy="5.5" r="2.5" />
          <path d="M1.5 13.5c0-2.2 2-3.8 4.5-3.8 1 0 1.9.25 2.6.68" />
          <path d="M10.5 10.5 14 14M14 10.5 10.5 14" />
        </svg>
      );
    case 'menu_sop_updated':
      return (
        <svg {...common}>
          <path d="M3.5 2.5h6L12.5 5.5v8h-9V2.5Z" />
          <path d="M6 9l1.4 1.4L10 7.6" />
        </svg>
      );
    case 'baseline_calculated':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <circle cx="8" cy="8" r="2.5" />
        </svg>
      );
    case 'weekly_summary':
      return (
        <svg {...common}>
          <rect x="2.5" y="3" width="11" height="10.5" rx="1.5" />
          <path d="M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" />
        </svg>
      );
  }
}

export const NotificationMenu = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onEscape);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const handleRowClick = (id: string, link?: string) => {
    markRead(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="ss-noti" ref={ref}>
      <motion.button
        className={`ss-noti__trigger ${open ? 'ss-noti__trigger--open' : ''}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.94 }}
      >
        <span className="ss-noti__bell">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2-1 4.6-1.6 5.3-.3.35-.05.95.42.95h11.36c.47 0 .72-.6.42-.95-.6-.7-1.6-2.1-1.6-5.3A4.5 4.5 0 0 0 10 2.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M8.4 16a1.8 1.8 0 0 0 3.2 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                className="ss-noti__badge"
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ss-noti__panel"
            role="menu"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
          >
            <div className="ss-noti__head">
              <span className="ss-noti__title">
                Notifications
                {unreadCount > 0 && (
                  <span className="ss-noti__count">{unreadCount} new</span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  className="ss-noti__markall"
                  type="button"
                  onClick={() => markAllRead()}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="ss-noti__list">
              {notifications.length === 0 ? (
                <div className="ss-noti__empty">
                  <span className="ss-noti__empty-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2-1 4.6-1.6 5.3-.3.35-.05.95.42.95h11.36c.47 0 .72-.6.42-.95-.6-.7-1.6-2.1-1.6-5.3A4.5 4.5 0 0 0 10 2.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path d="M8.4 16a1.8 1.8 0 0 0 3.2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <p className="ss-noti__empty-title">You're all caught up</p>
                  <p className="ss-noti__empty-sub">New activity will show up here.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const meta = notificationMeta[n.type];
                  return (
                    <button
                      key={n.id}
                      className={`ss-noti__row ${n.read ? '' : 'ss-noti__row--unread'}`}
                      type="button"
                      role="menuitem"
                      onClick={() => handleRowClick(n.id, n.link)}
                      style={{ ['--noti-accent' as string]: toneColor[meta.tone] }}
                    >
                      <span className="ss-noti__icon" aria-hidden="true">
                        <NotiIcon type={n.type} />
                      </span>
                      <span className="ss-noti__body">
                        <span className="ss-noti__row-title">{n.title}</span>
                        <span className="ss-noti__row-text">{n.body}</span>
                        <span className="ss-noti__meta">
                          <span className="ss-noti__tag">{meta.label}</span>
                          <span className="ss-noti__dot-sep" aria-hidden="true">·</span>
                          <span className="ss-noti__time">{timeAgo(n.createdAt)}</span>
                        </span>
                      </span>
                      {!n.read && <span className="ss-noti__unread-dot" aria-hidden="true" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
