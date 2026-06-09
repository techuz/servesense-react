import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/EmptyState';
import { useSop, type SopStep } from '@/lib/mock/sop';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { SopStepCard } from './SopStepCard';
import { SopStepDrawer } from './SopStepDrawer';
import './SOP.css';

export const SopPage = () => {
  const { steps, upsert, remove, move, stats } = useSop();
  const { notify } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SopStep | null>(null);

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (step: SopStep) => {
    setEditing(step);
    setDrawerOpen(true);
  };
  const handleDelete = (id: string) => {
    remove(id);
    notify({ tone: 'info', title: 'Step removed', description: 'The flow of service has been updated.' });
  };

  const editingPosition = editing ? steps.findIndex((s) => s.id === editing.id) + 1 : steps.length + 1;

  return (
    <motion.div className="ss-sop" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-sop__header" variants={fadeUp}>
        <div className="ss-sop__heading">
          <span className="eyebrow">Orientation · §5.3.3</span>
          <h1>Service SOP — Flow of Service</h1>
          <p className="ss-sop__lede">
            The step-by-step service flow every guest should experience. The AI follows this
            sequence during live sessions, flags missed steps, and uses the weights to score
            adherence in post-session reports.
          </p>
        </div>
        <div className="ss-sop__header-actions">
          <Badge tone="warning" subtle dot>
            Mandatory
          </Badge>
          <Button variant="primary" onClick={openNew}>
            + Add step
          </Button>
        </div>
      </motion.header>

      <motion.section className="ss-sop__overview" variants={fadeUp}>
        <div className="ss-sop__overview-grid">
          <Stat label="Steps in the flow" big={`${stats.total}`} sub="in sequence" />
          <Stat label="Total scoring weight" big={`${stats.totalWeight}`} sub="across all steps" />
          <Stat label="Tracked live" big="Yes" sub="compliance flagged per session" />
        </div>
      </motion.section>

      {steps.length === 0 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 4v16M5 6h10l-2 3 2 3H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No SOP steps yet"
          description="Add the steps of your flow of service so the AI can track compliance during sessions."
          action={
            <Button variant="primary" onClick={openNew}>
              + Add step
            </Button>
          }
        />
      ) : (
        <motion.ol className="ss-sop__list" variants={stagger(0.05, 0.1)} initial="hidden" animate="visible">
          {steps.map((step, i) => (
            <SopStepCard
              key={step.id}
              step={step}
              index={i}
              total={steps.length}
              isLast={i === steps.length - 1}
              onEdit={openEdit}
              onMove={move}
            />
          ))}
        </motion.ol>
      )}

      <SopStepDrawer
        open={drawerOpen}
        step={editing}
        position={editingPosition}
        onClose={() => setDrawerOpen(false)}
        onSave={upsert}
        onDelete={handleDelete}
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
