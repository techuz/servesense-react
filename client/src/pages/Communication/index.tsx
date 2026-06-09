import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { commAspectOrder, useCommunication, type CommAspect } from '@/lib/mock/communication';
import { fadeUp, stagger } from '@/lib/motion';
import { AspectCard } from './AspectCard';
import { AspectDrawer } from './AspectDrawer';
import './Communication.css';

export const CommunicationPage = () => {
  const { aspects, updateAspect } = useCommunication();
  const [editing, setEditing] = useState<CommAspect | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openEdit = (aspect: CommAspect) => {
    setEditing(aspect);
    setDrawerOpen(true);
  };

  return (
    <motion.div className="ss-comm" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-comm__header" variants={fadeUp}>
        <div className="ss-comm__heading">
          <span className="eyebrow">Orientation · §5.3.4</span>
          <h1>Communication &amp; Tone</h1>
          <p className="ss-comm__lede">
            How your team should sound and listen. The AI evaluates waiter speech against these
            standards during live sessions and triggers tone nudges in real time.
          </p>
        </div>
        <Badge tone="warning" subtle dot>
          Mandatory
        </Badge>
      </motion.header>

      <motion.section className="ss-comm__section" variants={fadeUp}>
        <div className="ss-comm__section-head">
          <div>
            <h2>Standards</h2>
            <p className="ss-comm__section-desc">
              The three dimensions per the SOW. Each captures the behavior expected of staff and why
              it matters.
            </p>
          </div>
        </div>

        <motion.div className="ss-comm__aspects" variants={stagger(0.06)} initial="hidden" animate="visible">
          {commAspectOrder.map((key) => (
            <AspectCard key={key} aspect={aspects[key]} onEdit={openEdit} />
          ))}
        </motion.div>
      </motion.section>

      <AspectDrawer
        open={drawerOpen}
        aspect={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={updateAspect}
      />
    </motion.div>
  );
};

export default CommunicationPage;
