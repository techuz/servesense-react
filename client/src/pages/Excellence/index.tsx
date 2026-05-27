import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { excellenceAreas, useExcellence } from '@/lib/mock/excellence';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { AreaCard } from './AreaCard';
import './Excellence.css';

export const ExcellencePage = () => {
  const { data } = useExcellence();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('excellence');
  const { notify } = useToast();
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'Excellence playbook removed',
      description: 'Upload a new PDF to populate this section.',
    });
  };

  return (
    <motion.div
      className="ss-excellence"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-excellence__header" variants={fadeUp}>
        <div className="ss-excellence__heading">
          <span className="eyebrow ss-excellence__eyebrow">Orientation · {meta.sowRef} · Advanced</span>
          <h1>Best Practices &amp; Excellence</h1>
          <p className="ss-excellence__lede">
            The advanced tier — what separates competent service from unforgettable service. Used
            by the AI to score proactive moments and flag staff ready for leadership roles.
          </p>
        </div>
        <Badge tone="gold" subtle dot>
          Advanced
        </Badge>
      </motion.header>

      {source ? (
        <>
          <OrientationSourceBanner
            source={source}
            onReplace={() => setReplaceOpen(true)}
            onRemove={handleRemove}
          />

          {/* --- Brand principle hero ----------------------------------------- */}
          <motion.section className="ss-principle" variants={fadeUp}>
            <div className="ss-principle__corner" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M14 14h6v6c0 5-2 9-6 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M28 14h6v6c0 5-2 9-6 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="ss-principle__body">
              <span className="eyebrow">House principle</span>
              <p className="ss-principle__quote">{data.brandPrinciple}</p>
              <p className="ss-principle__helper">
                The single sentence the AI uses as your brand's north star — quoted in pre-shift
                briefings and referenced when scoring sessions.
              </p>
            </div>
          </motion.section>

          {/* --- Four focus areas in a 2x2 grid ------------------------------ */}
          <motion.section
            className="ss-excellence__areas"
            variants={stagger(0.06, 0.05)}
            initial="hidden"
            animate="visible"
          >
            {excellenceAreas.map((areaMeta) => (
              <AreaCard
                key={areaMeta.key}
                meta={areaMeta}
                data={data.areas[areaMeta.key]}
              />
            ))}
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

export default ExcellencePage;
