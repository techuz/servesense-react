import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { sopProgress, sopSteps, useSop } from '@/lib/mock/sop';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { SopStepCard } from './SopStepCard';
import './SOP.css';

export const SopPage = () => {
  const { state, updateStep } = useSop();
  const progress = sopProgress(state);
  const pct = Math.round((progress.enabled / progress.total) * 100);

  return (
    <motion.div
      className="ss-sop"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-sop__header" variants={fadeUp}>
        <div className="ss-sop__heading">
          <span className="eyebrow">Orientation · §3.3</span>
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

      <motion.section className="ss-sop__overview" variants={fadeUp}>
        <div className="ss-sop__overview-grid">
          <Stat label="Active steps" big={`${progress.enabled}`} sub={`of ${progress.total}`} />
          <Stat label="Customised" big={`${progress.customized}`} sub="with phrase library" />
          <Stat label="SOP adherence weight" big="40%" sub="in performance score" />
        </div>

        <div className="ss-sop__progress" aria-label="Flow completion">
          <div className="ss-sop__progress-track">
            <motion.span
              className="ss-sop__progress-fill"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ ...transitions.softSpring, duration: 0.5 }}
            />
          </div>
          <span className="ss-sop__progress-text">
            <strong>{pct}%</strong> of the ritual is live
          </span>
        </div>
      </motion.section>

      <motion.ol
        className="ss-sop__list"
        variants={stagger(0.05, 0.1)}
        initial="hidden"
        animate="visible"
      >
        {sopSteps.map((meta, i) => (
          <SopStepCard
            key={meta.key}
            meta={meta}
            data={state[meta.key]}
            isLast={i === sopSteps.length - 1}
            onChange={(patch) => updateStep(meta.key, patch)}
          />
        ))}
      </motion.ol>

      <motion.div className="ss-sop__footer-note" variants={fadeUp}>
        <span className="ss-sop__footer-dot" aria-hidden="true" />
        Changes are saved automatically. The AI loads this SOP on its next live session.
      </motion.div>
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
