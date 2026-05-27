import type { ReactNode } from 'react';

/* ============================================================================
   Read-only display primitives used across the orientation sections.
   These render the "extracted from PDF" content the manager can no longer
   edit in-portal.
   ============================================================================ */

export const Fact = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) => (
  <div className={`ss-fact${fullWidth ? ' ss-fact--full' : ''}`}>
    <span className="ss-fact__label">{label}</span>
    <span className="ss-fact__value">{value}</span>
  </div>
);

export const FactGrid = ({ children }: { children: ReactNode }) => (
  <div className="ss-fact-grid">{children}</div>
);

export const BoolPill = ({ on, label }: { on: boolean; label: string }) => (
  <span className={`ss-bool-pill ${on ? 'ss-bool-pill--on' : 'ss-bool-pill--off'}`}>
    <span className="ss-bool-pill__icon" aria-hidden="true">
      {on ? (
        <svg width="10" height="10" viewBox="0 0 14 14">
          <path d="M3 7.5l2.5 2.5L11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 14 14">
          <path d="M4 4l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </span>
    {label}
  </span>
);

export const BoolGrid = ({ children }: { children: ReactNode }) => (
  <div className="ss-bool-grid">{children}</div>
);

export const RulesBlock = ({
  label,
  body,
}: {
  label: string;
  body: string;
}) => (
  <div className="ss-rules-block">
    <span className="ss-rules-block__label">{label}</span>
    <p className="ss-rules-block__body">{body}</p>
  </div>
);

export const SubsectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="ss-subsection-label">{children}</span>
);
