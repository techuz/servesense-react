import { motion } from 'framer-motion';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  priorityLabels,
  type SopRule,
  type SopRulePriority,
  type SopStage,
} from '@/lib/mock/sop';

interface SopStageCardProps {
  stage: SopStage;
  index: number;
  total: number;
  onUpdate: (stage: SopStage) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAddRule: (stageId: string) => void;
  onUpdateRule: (stageId: string, rule: SopRule) => void;
  onRemoveRule: (stageId: string, ruleId: string) => void;
}

export const SopStageCard = ({
  stage,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
}: SopStageCardProps) => {
  const patch = (p: Partial<SopStage>) => onUpdate({ ...stage, ...p });

  return (
    <motion.li className="ss-stage" variants={fadeUp} layout>
      <div className="ss-stage__head">
        <span className="ss-stage__num" aria-hidden="true">{index + 1}</span>

        <input
          className="ss-stage__name"
          value={stage.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Stage name (e.g. Greeting)"
          aria-label="Stage name"
        />

        <div className="ss-stage__reorder">
          <button
            type="button"
            className="ss-stage__icon-btn"
            onClick={() => onMove(stage.id, -1)}
            disabled={index === 0}
            aria-label="Move stage up"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="ss-stage__icon-btn"
            onClick={() => onMove(stage.id, 1)}
            disabled={index === total - 1}
            aria-label="Move stage down"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="ss-stage__icon-btn ss-stage__icon-btn--danger"
            onClick={() => onRemove(stage.id)}
            aria-label="Remove stage"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stage-level scoring fields (SOW §5.3.3) */}
      <div className="ss-stage__meta">
        <Input
          label="Expected outcome"
          value={stage.expectedOutcome}
          onChange={(e) => patch({ expectedOutcome: e.target.value })}
          placeholder="e.g. First impression"
        />
        <Input
          label="Scoring weight"
          type="number"
          min={0}
          value={String(stage.scoringWeight)}
          onChange={(e) => patch({ scoringWeight: parseFloat(e.target.value) || 0 })}
        />
      </div>

      {/* Rules */}
      <div className="ss-stage__rules">
        {stage.rules.map((rule, ri) => (
          <SopRuleRow
            key={rule.id}
            rule={rule}
            code={`R${ri + 1}`}
            onChange={(r) => onUpdateRule(stage.id, r)}
            onRemove={() => onRemoveRule(stage.id, rule.id)}
          />
        ))}

        <button
          type="button"
          className="ss-stage__add-rule"
          onClick={() => onAddRule(stage.id)}
        >
          + Add rule
        </button>
      </div>
    </motion.li>
  );
};

const priorityOptions: { value: SopRulePriority; label: string }[] = [
  { value: 'must', label: priorityLabels.must },
  { value: 'should', label: priorityLabels.should },
];

const SopRuleRow = ({
  rule,
  code,
  onChange,
  onRemove,
}: {
  rule: SopRule;
  code: string;
  onChange: (rule: SopRule) => void;
  onRemove: () => void;
}) => (
  <motion.div
    className={cn('ss-rule', `ss-rule--${rule.priority}`)}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    layout
  >
    <div className="ss-rule__head">
      <span className="ss-rule__code">{code}</span>
      <div className="ss-rule__head-right">
        <Select
          aria-label="Rule priority"
          value={rule.priority}
          onChange={(e) => onChange({ ...rule, priority: e.target.value as SopRulePriority })}
          options={priorityOptions}
          className="ss-rule__priority"
        />
        <button type="button" className="ss-rule__remove" onClick={onRemove} aria-label="Remove rule">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <Textarea
      label="Instruction"
      value={rule.instruction}
      onChange={(e) => onChange({ ...rule, instruction: e.target.value })}
      placeholder="What the waiter must or should do at this point."
      rows={2}
    />
    <Textarea
      label="Script (optional)"
      value={rule.script}
      onChange={(e) => onChange({ ...rule, script: e.target.value })}
      placeholder='e.g. "Welcome to Brasa, my name is…"'
      rows={2}
    />
  </motion.div>
);
