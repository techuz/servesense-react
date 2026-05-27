import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import './Sidebar.css';

type NavItem = { to: string; label: string };
type NavGroup = { label?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    items: [{ to: '/dashboard', label: 'Dashboard' }],
  },
  {
    label: 'Setup',
    items: [
      { to: '/restaurant', label: 'Restaurant & Outlets' },
      { to: '/staff', label: 'Staff' },
    ],
  },
  {
    label: 'Orientation',
    items: [
      { to: '/orientation/policies', label: 'Standard Policies' },
      { to: '/orientation/menu', label: 'Menu Knowledge' },
      { to: '/orientation/sop', label: 'Service SOP' },
      { to: '/orientation/tone', label: 'Communication & Tone' },
      { to: '/orientation/excellence', label: 'Best Practices' },
      { to: '/orientation/goals', label: 'Sales Goals' },
    ],
  },
  {
    label: 'Performance',
    items: [
      { to: '/performance', label: 'Staff Performance' },
      { to: '/coaching', label: 'Coaching & Lessons' },
    ],
  },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <motion.aside
      className="ss-sidebar"
      aria-label="Primary navigation"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...transitions.softSpring, delay: 0.05 }}
    >
      <motion.div
        className="ss-sidebar__brand"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.base, delay: 0.15 }}
      >
        <div className="ss-sidebar__logo" aria-hidden="true">
          <span>S</span>
        </div>
        <div className="ss-sidebar__brand-text">
          <span className="ss-sidebar__name">ServeSense</span>
          <span className="ss-sidebar__tagline">Manager</span>
        </div>
      </motion.div>

      <motion.nav
        className="ss-sidebar__nav"
        variants={stagger(0.04, 0.25)}
        initial="hidden"
        animate="visible"
      >
        {navGroups.map((group, idx) => (
          <motion.div key={idx} className="ss-sidebar__group" variants={fadeUp}>
            {group.label && <div className="ss-sidebar__group-label">{group.label}</div>}
            <ul className="ss-sidebar__list">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                return (
                  <li key={item.to} className="ss-sidebar__list-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive: routerActive }) =>
                        `ss-sidebar__link ${routerActive || isActive ? 'ss-sidebar__link--active' : ''}`
                      }
                    >
                      {(isActive) && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="ss-sidebar__pill"
                          transition={transitions.softSpring}
                        />
                      )}
                      <span className="ss-sidebar__link-label">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </motion.nav>

      <motion.div
        className="ss-sidebar__footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <small>v0.1 · Phase 1</small>
      </motion.div>
    </motion.aside>
  );
};
