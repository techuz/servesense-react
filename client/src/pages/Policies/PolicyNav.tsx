import { motion } from 'framer-motion';
import { transitions } from '@/lib/motion';
import {
  completionStats,
  isSectionComplete,
  policySections,
  type PolicySectionKey,
  type StandardPolicies,
} from '@/lib/mock/policies';

interface PolicyNavProps {
  policies: StandardPolicies;
  active: PolicySectionKey;
  onSelect: (key: PolicySectionKey) => void;
}

export const PolicyNav = ({ policies, active, onSelect }: PolicyNavProps) => {
  const stats = completionStats(policies);

  return (
    <aside className="ss-policies__nav" aria-label="Policy sections">
      <div className="ss-policies__nav-header">
        <span className="eyebrow">Mandatory</span>
        <h2>Standard Policies</h2>
        <p className="ss-policies__nav-desc">
          Single source of truth for service standards across every outlet. These rules guide the
          AI during live guest conversations.
        </p>

        <div className="ss-policies__progress">
          <div className="ss-policies__progress-bar" aria-hidden="true">
            <motion.span
              className="ss-policies__progress-fill"
              initial={false}
              animate={{ width: `${stats.percent}%` }}
              transition={{ ...transitions.softSpring, duration: 0.5 }}
            />
          </div>
          <div className="ss-policies__progress-text">
            <strong>{stats.complete} of {stats.total}</strong>
            <span>sections complete</span>
          </div>
        </div>
      </div>

      <ul className="ss-policies__nav-list">
        {policySections.map((section) => {
          const isActive = active === section.key;
          const isComplete = isSectionComplete(policies, section.key);
          return (
            <li key={section.key}>
              <button
                type="button"
                className={`ss-policies__nav-item ${isActive ? 'ss-policies__nav-item--active' : ''}`}
                onClick={() => onSelect(section.key)}
              >
                {isActive && (
                  <motion.span
                    layoutId="policy-nav-active"
                    className="ss-policies__nav-pill"
                    transition={transitions.softSpring}
                  />
                )}
                <span className="ss-policies__nav-content">
                  <span className="ss-policies__nav-row">
                    <span
                      className={`ss-policies__nav-dot ${isComplete ? 'ss-policies__nav-dot--complete' : ''}`}
                      aria-hidden="true"
                    >
                      {isComplete && (
                        <svg width="10" height="10" viewBox="0 0 14 14">
                          <path
                            d="M3 7.5l2.5 2.5L11 4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="ss-policies__nav-title">{section.title}</span>
                  </span>
                  <span className="ss-policies__nav-sub">{section.short}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
