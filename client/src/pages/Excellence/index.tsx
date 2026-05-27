import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Textarea } from '@/components/primitives/Textarea';
import { excellenceAreas, useExcellence } from '@/lib/mock/excellence';
import { fadeUp, stagger } from '@/lib/motion';
import { AreaCard } from './AreaCard';
import './Excellence.css';

export const ExcellencePage = () => {
  const { data, updatePrinciple, updateArea } = useExcellence();

  return (
    <motion.div
      className="ss-excellence"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-excellence__header" variants={fadeUp}>
        <div className="ss-excellence__heading">
          <span className="eyebrow ss-excellence__eyebrow">Orientation · §3.5 · Advanced</span>
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
          <Textarea
            value={data.brandPrinciple}
            onChange={(e) => updatePrinciple(e.target.value)}
            rows={3}
            className="ss-principle__field"
            aria-label="House principle"
          />
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
        {excellenceAreas.map((meta) => (
          <AreaCard
            key={meta.key}
            meta={meta}
            data={data.areas[meta.key]}
            onChange={(patch) => updateArea(meta.key, patch)}
          />
        ))}
      </motion.section>

      <motion.div className="ss-excellence__footer-note" variants={fadeUp}>
        <span className="ss-excellence__footer-dot" aria-hidden="true" />
        Advanced standards are layered on top of the mandatory orientation modules.
      </motion.div>
    </motion.div>
  );
};

export default ExcellencePage;
