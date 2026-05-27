import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import {
  formatSessionDate,
  serviceModeLabels,
  type Session,
} from '@/lib/mock/performance';
import { cn } from '@/lib/cn';
import './SessionDrawer.css';

interface SessionDrawerProps {
  open: boolean;
  session: Session | null;
  staffName: string;
  onClose: () => void;
}

export const SessionDrawer = ({
  open,
  session,
  staffName,
  onClose,
}: SessionDrawerProps) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Session detail"
      description={session ? `${staffName} · ${formatSessionDate(session.startedAt)}` : undefined}
      size="lg"
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {session && (
        <div className="ss-sess">
          {/* --- Header summary ----------------------------------- */}
          <header className="ss-sess__header">
            <div className="ss-sess__header-main">
              <div className="ss-sess__table-block">
                <span className="ss-sess__table-tag">Table</span>
                <span className="ss-sess__table-num">{session.tableNumber}</span>
              </div>
              <div className="ss-sess__guest-block">
                <span className="ss-sess__guest-label">Guest</span>
                <span className="ss-sess__guest-name">
                  {session.guestName ?? 'Walk-in'}
                </span>
              </div>
              <div className="ss-sess__service-block">
                <Badge tone={session.serviceMode === 'dinner' ? 'brand' : 'gold'} subtle>
                  {serviceModeLabels[session.serviceMode]}
                </Badge>
                <span className="ss-sess__duration">{session.durationMins} min</span>
              </div>
            </div>
            {session.guestRating != null && (
              <div className="ss-sess__rating">
                <span className="ss-sess__rating-stars">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const filled = i <= Math.round(session.guestRating!);
                    return (
                      <svg
                        key={i}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={filled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ color: 'var(--ss-gold-500)' }}
                      >
                        <path d="M12 2l2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.7L12 2z" />
                      </svg>
                    );
                  })}
                </span>
                <span className="ss-sess__rating-num">
                  {session.guestRating.toFixed(1)}
                </span>
                <span className="ss-sess__rating-label">guest rating</span>
              </div>
            )}
          </header>

          {/* --- KPIs grid ---------------------------------------- */}
          <section className="ss-sess__section">
            <h3 className="ss-sess__section-title">Session KPIs</h3>
            <div className="ss-sess__kpi-grid">
              <KpiCell
                label="Upsell attempts"
                value={session.upsellAttempts.toString()}
              />
              <KpiCell
                label="Successful upsells"
                value={session.successfulUpsells.toString()}
                tone={session.successfulUpsells > 0 ? 'green' : 'neutral'}
              />
              <KpiCell
                label="Missed opportunities"
                value={session.missedOpportunities.toString()}
                tone={session.missedOpportunities >= 3 ? 'danger' : 'neutral'}
              />
              <KpiCell
                label="Confidence"
                value={session.confidenceScore.toString()}
                unit="/100"
                bar={session.confidenceScore}
              />
              <KpiCell
                label="Menu accuracy"
                value={session.menuKnowledgeAccuracy.toString()}
                unit="%"
                bar={session.menuKnowledgeAccuracy}
              />
              <KpiCell
                label="Tone"
                value={session.toneScore.toString()}
                unit="/100"
                bar={session.toneScore}
              />
              <KpiCell
                label="Empathy"
                value={session.empathyScore.toString()}
                unit="/100"
                bar={session.empathyScore}
              />
              <KpiCell
                label="Food safety"
                value={session.foodSafetyAwareness.toString()}
                unit="%"
                bar={session.foodSafetyAwareness}
              />
              <KpiCell
                label="Tone consistency"
                value={session.toneConsistency.toString()}
                unit="%"
                bar={session.toneConsistency}
              />
            </div>
          </section>

          {/* --- Highlights --------------------------------------- */}
          {session.highlights.length > 0 && (
            <section className="ss-sess__section">
              <h3 className="ss-sess__section-title">Highlights</h3>
              <ul className="ss-sess__highlights" role="list">
                {session.highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    className={cn(
                      'ss-sess__highlight',
                      `ss-sess__highlight--${h.type}`,
                    )}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <span className="ss-sess__highlight-icon" aria-hidden="true">
                      {h.type === 'positive' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 8v5M12 16.5v.5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                      )}
                    </span>
                    <span className="ss-sess__highlight-text">{h.text}</span>
                  </motion.li>
                ))}
              </ul>
            </section>
          )}

          {/* --- Transcript preview ------------------------------- */}
          {session.transcriptPreview && (
            <section className="ss-sess__section">
              <h3 className="ss-sess__section-title">Transcript preview</h3>
              <blockquote className="ss-sess__transcript">
                {session.transcriptPreview}
              </blockquote>
              <p className="ss-sess__transcript-hint">
                Full transcript becomes available once the AI speech service is live.
              </p>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
};

const KpiCell = ({
  label,
  value,
  unit,
  bar,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  unit?: string;
  /** 0–100 for bar; omit to skip the visual bar. */
  bar?: number;
  tone?: 'green' | 'danger' | 'neutral';
}) => (
  <div className={cn('ss-sess__cell', `ss-sess__cell--${tone}`)}>
    <span className="ss-sess__cell-label">{label}</span>
    <span className="ss-sess__cell-value">
      {value}
      {unit && <span className="ss-sess__cell-unit">{unit}</span>}
    </span>
    {bar != null && (
      <div className="ss-sess__cell-bar" aria-hidden="true">
        <motion.div
          className={cn(
            'ss-sess__cell-bar-fill',
            bar >= 85 && 'ss-sess__cell-bar-fill--good',
            bar < 75 && bar >= 60 && 'ss-sess__cell-bar-fill--warn',
            bar < 60 && 'ss-sess__cell-bar-fill--bad',
          )}
          initial={{ width: 0 }}
          animate={{ width: `${bar}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    )}
  </div>
);
