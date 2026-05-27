import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { sopProgress, sopSteps, useSop } from '@/lib/mock/sop';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { SopStepCard } from './SopStepCard';
import './SOP.css';

export const SopPage = () => {
  const { state } = useSop();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('sop');
  const { notify } = useToast();
  const [replaceOpen, setReplaceOpen] = useState(false);

  const progress = sopProgress(state);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'SOP document removed',
      description: 'Upload a new PDF to populate this section.',
    });
  };

  return (
    <motion.div
      className="ss-sop"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-sop__header" variants={fadeUp}>
        <div className="ss-sop__heading">
          <span className="eyebrow">Orientation · {meta.sowRef}</span>
          <h1>Service SOP — Flow of Service</h1>
          <p className="ss-sop__lede">
            The ten-step choreography every guest should experience. The AI follows this script
            during live sessions, flags missed steps, and scores adherence in post-session reports.
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

          <motion.section className="ss-sop__overview" variants={fadeUp}>
            <div className="ss-sop__overview-grid">
              <Stat label="Steps in document" big={`${progress.enabled}`} sub={`of ${progress.total}`} />
              <Stat label="With phrase library" big={`${progress.customized}`} sub="detailed coaching" />
              <Stat label="SOP adherence weight" big="40%" sub="in performance score" />
            </div>
          </motion.section>

          <motion.ol
            className="ss-sop__list"
            variants={stagger(0.05, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {sopSteps.map((step, i) => (
              <SopStepCard
                key={step.key}
                meta={step}
                data={state[step.key]}
                isLast={i === sopSteps.length - 1}
              />
            ))}
          </motion.ol>
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

const Stat = ({ label, big, sub }: { label: string; big: string; sub: string }) => (
  <div className="ss-sop__stat">
    <span className="ss-sop__stat-label">{label}</span>
    <span className="ss-sop__stat-value">
      <span className="ss-sop__stat-big">{big}</span>
      <span className="ss-sop__stat-sub">{sub}</span>
    </span>
  </div>
);

export default SopPage;
