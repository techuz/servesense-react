import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      className="ss-empty"
      variants={stagger(0.08, 0.05)}
      initial="hidden"
      animate="visible"
    >
      {icon && (
        <motion.div className="ss-empty__icon" variants={fadeUp}>
          {icon}
        </motion.div>
      )}
      <motion.h3 className="ss-empty__title" variants={fadeUp}>
        {title}
      </motion.h3>
      {description && (
        <motion.p className="ss-empty__desc" variants={fadeUp}>
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div className="ss-empty__action" variants={fadeUp}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};
