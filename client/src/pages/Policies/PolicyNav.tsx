import { motion } from 'framer-motion';
import { transitions } from '@/lib/motion';
import {
  policySections,
  type PolicySectionKey,
} from '@/lib/mock/policies';

interface PolicyNavProps {
  active: PolicySectionKey;
  onSelect: (key: PolicySectionKey) => void;
}

export const PolicyNav = ({ active, onSelect }: PolicyNavProps) => {
  return (
    <aside className="ss-policies__nav" aria-label="Policy sections">
      <div className="ss-policies__nav-header">
        <span className="eyebrow">Mandatory</span>
        <h2>Standard Policies</h2>
        <p className="ss-policies__nav-desc">
          Sections extracted from the uploaded policy document. Each one is referenced by the
          AI during live guest conversations.
        </p>
      </div>

      <ul className="ss-policies__nav-list">
        {policySections.map((section) => {
          const isActive = active === section.key;
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
                  <span className="ss-policies__nav-title">{section.title}</span>
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
