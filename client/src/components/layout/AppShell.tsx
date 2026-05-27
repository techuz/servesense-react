import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { pageTransition } from '@/lib/motion';
import './AppShell.css';

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="ss-shell">
      <Sidebar />
      <div className="ss-shell__main">
        <Topbar />
        <main className="ss-shell__content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="ss-shell__page"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
