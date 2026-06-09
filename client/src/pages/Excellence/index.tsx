import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { excellenceAreaOrder, useExcellence, type ExcellenceArea } from '@/lib/mock/excellence';
import { fadeUp, stagger } from '@/lib/motion';
import { AreaCard } from './AreaCard';
import { AreaDrawer } from './AreaDrawer';
import './Excellence.css';

export const ExcellencePage = () => {
  const { areas, updateArea } = useExcellence();
  const [editing, setEditing] = useState<ExcellenceArea | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openEdit = (area: ExcellenceArea) => {
    setEditing(area);
    setDrawerOpen(true);
  };

  return (
    <motion.div className="ss-excellence" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-excellence__header" variants={fadeUp}>
        <div className="ss-excellence__heading">
          <span className="eyebrow ss-excellence__eyebrow">Orientation · §5.3.5 · Advanced</span>
          <h1>Best Practices &amp; Excellence</h1>
          <p className="ss-excellence__lede">
            The advanced tier — what separates competent service from unforgettable service. Optional,
            and used by the AI to recognise proactive moments during live sessions.
          </p>
        </div>
        <Badge tone="gold" subtle dot>
          Advanced · Optional
        </Badge>
      </motion.header>

      <motion.section
        className="ss-excellence__areas"
        variants={stagger(0.06, 0.05)}
        initial="hidden"
        animate="visible"
      >
        {excellenceAreaOrder.map((key) => (
          <AreaCard key={key} area={areas[key]} onEdit={openEdit} />
        ))}
      </motion.section>

      <AreaDrawer
        open={drawerOpen}
        area={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={updateArea}
      />
    </motion.div>
  );
};

export default ExcellencePage;
