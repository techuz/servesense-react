import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/cn';
import type { SopStep } from '@/lib/mock/sop';

interface Props {
  step: SopStep;
  index: number;
  total: number;
  isLast: boolean;
  onEdit: (step: SopStep) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

export const SopStepCard = ({ step, index, total, isLast, onEdit, onMove }: Props) => {
  const position = index + 1;
  return (
    <motion.li className="ss-sop-step" variants={fadeUp} layout>
      <div className="ss-sop-step__rail" aria-hidden="true">
        <div className="ss-sop-step__num ss-sop-step__num--on">
          <span>{String(position).padStart(2, '0')}</span>
        </div>
        {!isLast && <div className="ss-sop-step__connector" />}
      </div>

      <div className="ss-sop-step__body">
        <header className="ss-sop-step__head">
          <div className="ss-sop-step__title-block">
            <div className="ss-sop-step__title-row">
              <h3 className="ss-sop-step__name">{step.name}</h3>
              {step.expectedOutcome && (
                <Badge tone="gold" subtle>
                  {step.expectedOutcome}
                </Badge>
              )}
            </div>
            <span className="ss-sop-step__principle">Scoring weight · {step.scoringWeight}</span>
          </div>

          <div className="ss-sop-step__controls">
            <div className="ss-sop-step__reorder">
              <button
                type="button"
                className="ss-sop-step__move"
                onClick={() => onMove(step.id, -1)}
                disabled={index === 0}
                aria-label="Move step up"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 8.5L7 5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="ss-sop-step__move"
                onClick={() => onMove(step.id, 1)}
                disabled={index === total - 1}
                aria-label="Move step down"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <button type="button" className={cn('ss-sop-step__edit')} onClick={() => onEdit(step)}>
              Edit →
            </button>
          </div>
        </header>

        <p className="ss-sop-step__description">{step.description}</p>
      </div>
    </motion.li>
  );
};
