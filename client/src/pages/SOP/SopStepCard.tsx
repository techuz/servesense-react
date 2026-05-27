import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { fadeUp, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import type { SopStepData, SopStepMeta } from '@/lib/mock/sop';
import { PhraseList } from '@/components/primitives/PhraseList';

interface Props {
  meta: SopStepMeta;
  data: SopStepData;
  isLast: boolean;
}

export const SopStepCard = ({ meta, data, isLast }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const hasDetails =
    data.bestPractices.length > 0 ||
    data.thingsToAvoid.length > 0 ||
    data.examplePhrases.length > 0;

  return (
    <motion.li
      className={cn(
        'ss-sop-step',
        !data.enabled && 'ss-sop-step--off',
        expanded && 'ss-sop-step--expanded',
      )}
      variants={fadeUp}
      layout
    >
      {/* Left rail: number + connector */}
      <div className="ss-sop-step__rail" aria-hidden="true">
        <div className={cn('ss-sop-step__num', data.enabled && 'ss-sop-step__num--on')}>
          <span>{String(meta.order).padStart(2, '0')}</span>
        </div>
        {!isLast && <div className="ss-sop-step__connector" />}
      </div>

      {/* Right content */}
      <div className="ss-sop-step__body">
        <header className="ss-sop-step__head">
          <div className="ss-sop-step__title-block">
            <div className="ss-sop-step__title-row">
              <h3 className="ss-sop-step__name">{meta.name}</h3>
              <Badge tone="gold" subtle>
                {meta.outcome}
              </Badge>
              {!data.enabled && (
                <Badge tone="neutral" subtle>
                  Not in document
                </Badge>
              )}
            </div>
            <span className="ss-sop-step__principle">{meta.shortPrinciple}</span>
          </div>

          {hasDetails && (
            <button
              type="button"
              className="ss-sop-step__toggle"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse step' : 'Expand step'}
            >
              <motion.svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  d="M2 4l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>
          )}
        </header>

        {data.description && (
          <p className="ss-sop-step__description">{data.description}</p>
        )}

        <AnimatePresence initial={false}>
          {expanded && hasDetails && (
            <motion.div
              className="ss-sop-step__expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
              transition={transitions.base}
              style={{ overflow: 'hidden' }}
            >
              <div className="ss-sop-step__lists">
                {data.bestPractices.length > 0 && (
                  <PhraseList
                    label="Best practices"
                    helper="Specific things waiters should do at this step."
                    phrases={data.bestPractices}
                    tone="do"
                    readOnly
                  />
                )}
                {data.thingsToAvoid.length > 0 && (
                  <PhraseList
                    label="Things to avoid"
                    helper="Behaviours the AI will flag if it detects them."
                    phrases={data.thingsToAvoid}
                    tone="avoid"
                    readOnly
                  />
                )}
              </div>

              {data.examplePhrases.length > 0 && (
                <PhraseList
                  label="Example phrases"
                  helper="Sample lines the AI can suggest in real time during this step."
                  phrases={data.examplePhrases}
                  tone="quote"
                  readOnly
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
};
