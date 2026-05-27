import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  commAspects,
  newSituationId,
  situationCategoryLabels,
  useCommunication,
  type SituationCategory,
} from '@/lib/mock/communication';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { AspectCard } from './AspectCard';
import { SituationCard } from './SituationCard';
import './Communication.css';

type CategoryFilter = 'all' | SituationCategory;

export const CommunicationPage = () => {
  const { data, updateAspect, upsertSituation, removeSituation } = useCommunication();
  const { notify } = useToast();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? data.situations
        : data.situations.filter((s) => s.category === filter),
    [data.situations, filter],
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: data.situations.length };
    for (const cat of Object.keys(situationCategoryLabels)) {
      out[cat] = data.situations.filter((s) => s.category === cat).length;
    }
    return out;
  }, [data.situations]);

  const addNew = () => {
    const id = newSituationId();
    upsertSituation({
      id,
      category: filter === 'all' ? 'complaint' : filter,
      title: 'New scenario',
      context: '',
      triggerSignals: [],
      recoveryPhrases: [],
    });
    notify({ tone: 'success', title: 'Scenario added', description: 'Fill in the details below.' });
  };

  return (
    <motion.div
      className="ss-comm"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-comm__header" variants={fadeUp}>
        <div className="ss-comm__heading">
          <span className="eyebrow">Orientation · §3.4</span>
          <h1>Communication &amp; Tone</h1>
          <p className="ss-comm__lede">
            How your team should sound and listen. The AI uses these standards to monitor live
            sessions, flag tone deviations, and surface de-escalation phrases when conversations
            get sensitive.
          </p>
        </div>
        <Badge tone="warning" subtle dot>
          Mandatory
        </Badge>
      </motion.header>

      {/* --- Section 1: the three aspects -------------------------------- */}
      <motion.section className="ss-comm__section" variants={fadeUp}>
        <div className="ss-comm__section-head">
          <div>
            <h2>Standards</h2>
            <p className="ss-comm__section-desc">
              Three dimensions per the SOW. Each captures how a great service interaction sounds.
            </p>
          </div>
        </div>

        <motion.div
          className="ss-comm__aspects"
          variants={stagger(0.06)}
          initial="hidden"
          animate="visible"
        >
          {commAspects.map((meta) => (
            <AspectCard
              key={meta.key}
              meta={meta}
              data={data.aspects[meta.key]}
              onChange={(patch) => updateAspect(meta.key, patch)}
            />
          ))}
        </motion.div>
      </motion.section>

      {/* --- Section 2: difficult situations playbook -------------------- */}
      <motion.section className="ss-comm__section" variants={fadeUp}>
        <div className="ss-comm__section-head">
          <div>
            <h2>Difficult situations playbook</h2>
            <p className="ss-comm__section-desc">
              Scenarios the AI watches for in real time, with the recovery script your team should
              use when each one is detected.
            </p>
          </div>
          <Button variant="primary" onClick={addNew}>
            + Add scenario
          </Button>
        </div>

        {/* Category filter rail */}
        <div className="ss-comm__filter-rail">
          <FilterChip
            label="All"
            count={counts.all}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {(Object.keys(situationCategoryLabels) as SituationCategory[]).map((c) => (
            <FilterChip
              key={c}
              label={situationCategoryLabels[c]}
              count={counts[c] ?? 0}
              active={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 6h14v10a2 2 0 01-2 2H9l-4 4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="No scenarios yet"
            description="Add common situations your team faces — complaints, allergy concerns, slow service. Each gets a recovery script the AI will surface in real time."
            action={
              <Button variant="primary" onClick={addNew}>
                + Add first scenario
              </Button>
            }
          />
        ) : (
          <motion.div
            className="ss-comm__situations"
            variants={stagger(0.05)}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence initial={false}>
              {filtered.map((s) => (
                <SituationCard
                  key={s.id}
                  situation={s}
                  onChange={upsertSituation}
                  onDelete={() => {
                    removeSituation(s.id);
                    notify({ tone: 'info', title: 'Scenario removed', description: s.title });
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.section>

      <motion.div className="ss-comm__footer-note" variants={fadeUp}>
        <span className="ss-comm__footer-dot" aria-hidden="true" />
        Changes are saved automatically. The AI uses these on its next live session.
      </motion.div>
    </motion.div>
  );
};

const FilterChip = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={cn('ss-comm__chip', active && 'ss-comm__chip--on')}
    onClick={onClick}
  >
    {active && <motion.span layoutId="ss-comm-filter-active" className="ss-comm__chip-pill" />}
    <span className="ss-comm__chip-label">{label}</span>
    <span className="ss-comm__chip-count">{count}</span>
  </button>
);

export default CommunicationPage;
