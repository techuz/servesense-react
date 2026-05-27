import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Switch } from '@/components/primitives/Switch';
import { Textarea } from '@/components/primitives/Textarea';
import { Badge } from '@/components/primitives/Badge';
import { fadeUp, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import type { SopStepData, SopStepMeta } from '@/lib/mock/sop';
import { PhraseList } from '@/components/primitives/PhraseList';

interface Props {
  meta: SopStepMeta;
  data: SopStepData;
  isLast: boolean;
  onChange: (patch: Partial<SopStepData>) => void;
}

export const SopStepCard = ({ meta, data, isLast, onChange }: Props) => {
  const [expanded, setExpanded] = useState(false);

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
            </div>
            <span className="ss-sop-step__principle">{meta.shortPrinciple}</span>
          </div>

          <div className="ss-sop-step__actions">
            <Switch
              size="sm"
              checked={data.enabled}
              onChange={(on) => onChange({ enabled: on })}
              label={data.enabled ? 'Enabled' : 'Skipped'}
            />
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
          </div>
        </header>

        <Textarea
          label="Description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={expanded ? 3 : 2}
          disabled={!data.enabled}
        />

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              className="ss-sop-step__expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
              transition={transitions.base}
              style={{ overflow: 'hidden' }}
            >
              <div className="ss-sop-step__lists">
                <PhraseList
                  label="Best practices"
                  helper="Specific things waiters should do at this step."
                  phrases={data.bestPractices}
                  onChange={(next) => onChange({ bestPractices: next })}
                  tone="do"
                  placeholder="e.g. Make eye contact before speaking"
                />
                <PhraseList
                  label="Things to avoid"
                  helper="Behaviours the AI will flag if it detects them."
                  phrases={data.thingsToAvoid}
                  onChange={(next) => onChange({ thingsToAvoid: next })}
                  tone="avoid"
                  placeholder="e.g. Keeping the guest waiting at the door"
                />
              </div>

              <PhraseList
                label="Example phrases"
                helper="Sample lines the AI can suggest in real time during this step."
                phrases={data.examplePhrases}
                onChange={(next) => onChange({ examplePhrases: next })}
                tone="quote"
                placeholder='e.g. "Welcome to Lumière, do you have a reservation?"'
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
};
