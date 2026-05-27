import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { EmptyState } from '@/components/primitives/EmptyState';
import {
  commAspects,
  situationCategoryLabels,
  useCommunication,
  type SituationCategory,
} from '@/lib/mock/communication';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { AspectCard } from './AspectCard';
import { SituationCard } from './SituationCard';
import './Communication.css';

type CategoryFilter = 'all' | SituationCategory;

export const CommunicationPage = () => {
  const { data } = useCommunication();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('communication');
  const { notify } = useToast();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'Communication document removed',
      description: 'Upload a new PDF to populate this section.',
    });
  };

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

  return (
    <motion.div
      className="ss-comm"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-comm__header" variants={fadeUp}>
        <div className="ss-comm__heading">
          <span className="eyebrow">Orientation · {meta.sowRef}</span>
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

      {source ? (
        <>
          <OrientationSourceBanner
            source={source}
            onReplace={() => setReplaceOpen(true)}
            onRemove={handleRemove}
          />

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
              {commAspects.map((aspectMeta) => (
                <AspectCard
                  key={aspectMeta.key}
                  meta={aspectMeta}
                  data={data.aspects[aspectMeta.key]}
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
                title="No scenarios in this category"
                description="Switch the filter back to All to see every scenario extracted from the document."
              />
            ) : (
              <motion.div
                className="ss-comm__situations"
                variants={stagger(0.05)}
                initial="hidden"
                animate="visible"
              >
                {filtered.map((s) => (
                  <SituationCard key={s.id} situation={s} />
                ))}
              </motion.div>
            )}
          </motion.section>
        </>
      ) : (
        <motion.div variants={fadeUp}>
          <OrientationUpload module={meta} onComplete={uploadSource} />
        </motion.div>
      )}

      <OrientationReplaceDrawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        module={meta}
        onComplete={uploadSource}
      />
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
