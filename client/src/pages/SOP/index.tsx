import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Drawer } from '@/components/primitives/Drawer';
import { useSop, emptyStage, type SopStage } from '@/lib/mock/sop';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger } from '@/lib/motion';
import { SopStageCard } from './SopStageCard';
import { SopUpload } from './SopUpload';
import './SOP.css';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const SopPage = () => {
  const {
    source,
    stages,
    setFromUpload,
    clearSource,
    upsertStage,
    removeStage,
    moveStage,
    addRule,
    upsertRule,
    removeRule,
    stats,
  } = useSop();
  const { notify } = useToast();
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleExtracted = (fileName: string, extracted: SopStage[], pageCount: number) => {
    setFromUpload(fileName, extracted, pageCount);
    setReplaceOpen(false);
    notify({
      tone: 'success',
      title: 'Document processed',
      description: `${extracted.length} stages extracted from ${fileName}. Review and edit the rules below.`,
    });
  };

  const handleAddStage = () => {
    upsertStage(emptyStage());
  };

  const handleRemoveDoc = () => {
    clearSource();
    notify({ tone: 'info', title: 'Document removed', description: 'Upload a new SOP document to start again.' });
  };

  // No source yet → full-bleed upload empty state.
  if (!source) {
    return (
      <motion.div className="ss-sop" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
        <motion.header className="ss-sop__header" variants={fadeUp}>
          <div className="ss-sop__heading">
            <span className="eyebrow">Orientation · §5.3.3</span>
            <h1>Service SOP — Flow of Service</h1>
            <p className="ss-sop__lede">
              Upload your service standard document. ServeSense extracts each stage of service and
              the rules within it — then you can edit the rules, add new ones, and add stages.
            </p>
          </div>
          <div className="ss-sop__header-actions">
            <Badge tone="warning" subtle dot>
              Mandatory
            </Badge>
          </div>
        </motion.header>

        <motion.div variants={fadeUp}>
          <SopUpload onExtracted={handleExtracted} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="ss-sop" variants={stagger(0.08, 0)} initial="hidden" animate="visible">
      <motion.header className="ss-sop__header" variants={fadeUp}>
        <div className="ss-sop__heading">
          <span className="eyebrow">Orientation · §5.3.3</span>
          <h1>Service SOP — Flow of Service</h1>
          <p className="ss-sop__lede">
            Each stage of service and the rules the AI checks during live sessions. Extracted from
            your document — edit any rule, add rules, or add stages.
          </p>
        </div>
        <div className="ss-sop__header-actions">
          <Badge tone="warning" subtle dot>
            Mandatory
          </Badge>
          <Button variant="primary" onClick={handleAddStage}>
            + Add stage
          </Button>
        </div>
      </motion.header>

      {/* Source banner */}
      <motion.div className="ss-sop__source" variants={fadeUp}>
        <div className="ss-sop__source-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 3h9l5 5v13H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M15 3v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ss-sop__source-text">
          <span className="ss-sop__source-name">{source.fileName}</span>
          <span className="ss-sop__source-meta">
            Uploaded {timeAgo(source.uploadedAt)} · {source.pageCount} pages parsed
          </span>
        </div>
        <div className="ss-sop__source-actions">
          <Button variant="secondary" size="sm" onClick={() => setReplaceOpen(true)}>
            Replace document
          </Button>
          <button
            type="button"
            className="ss-sop__source-remove"
            onClick={handleRemoveDoc}
            aria-label="Remove document"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Overview */}
      <motion.section className="ss-sop__overview" variants={fadeUp}>
        <div className="ss-sop__overview-grid">
          <Stat label="Stages of service" big={`${stats.stageCount}`} sub="in sequence" />
          <Stat label="Rules tracked" big={`${stats.ruleCount}`} sub={`${stats.mustCount} must-do`} />
          <Stat label="Total scoring weight" big={`${stats.totalWeight}`} sub="across all stages" />
        </div>
      </motion.section>

      <motion.ol className="ss-sop__list" variants={stagger(0.05, 0.1)} initial="hidden" animate="visible">
        {stages.map((stage, i) => (
          <SopStageCard
            key={stage.id}
            stage={stage}
            index={i}
            total={stages.length}
            onUpdate={upsertStage}
            onRemove={removeStage}
            onMove={moveStage}
            onAddRule={addRule}
            onUpdateRule={upsertRule}
            onRemoveRule={removeRule}
          />
        ))}
      </motion.ol>

      <div className="ss-sop__add-stage-row">
        <Button variant="secondary" onClick={handleAddStage}>
          + Add stage
        </Button>
      </div>

      <Drawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Replace SOP document"
        description="Upload a new document. Re-extracting replaces the current stages and rules."
        size="md"
      >
        <SopUpload onExtracted={handleExtracted} compact />
      </Drawer>
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
