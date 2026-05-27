import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { PhraseList } from '@/components/primitives/PhraseList';
import { Button } from '@/components/primitives/Button';
import { fadeUp } from '@/lib/motion';
import {
  situationCategoryLabels,
  type DifficultSituation,
  type SituationCategory,
} from '@/lib/mock/communication';

interface Props {
  situation: DifficultSituation;
  onChange: (next: DifficultSituation) => void;
  onDelete: () => void;
}

export const SituationCard = ({ situation, onChange, onDelete }: Props) => {
  const update = (patch: Partial<DifficultSituation>) => {
    onChange({ ...situation, ...patch });
  };

  return (
    <motion.article className="ss-situation" variants={fadeUp} layout>
      <header className="ss-situation__head">
        <div className="ss-situation__title-block">
          <Badge tone="warning" subtle>
            {situationCategoryLabels[situation.category]}
          </Badge>
          <Input
            value={situation.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Scenario title"
            aria-label="Scenario title"
            className="ss-situation__title-input"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Remove
        </Button>
      </header>

      <Select
        label="Category"
        value={situation.category}
        onChange={(e) => update({ category: e.target.value as SituationCategory })}
        options={(Object.keys(situationCategoryLabels) as SituationCategory[]).map((c) => ({
          value: c,
          label: situationCategoryLabels[c],
        }))}
      />

      <Textarea
        label="When this happens"
        value={situation.context}
        onChange={(e) => update({ context: e.target.value })}
        rows={2}
        hint="Set the scene — what the AI should look for in the live conversation."
      />

      <div className="ss-situation__lists">
        <PhraseList
          label="Trigger signals"
          helper="Keywords or behaviours the AI listens for to detect this scenario."
          phrases={situation.triggerSignals}
          onChange={(next) => update({ triggerSignals: next })}
          tone="avoid"
          placeholder="e.g. guest looking at watch repeatedly"
        />
        <PhraseList
          label="Recovery phrases"
          helper="Lines the AI surfaces in real time when this scenario is detected."
          phrases={situation.recoveryPhrases}
          onChange={(next) => update({ recoveryPhrases: next })}
          tone="quote"
          placeholder='e.g. "I want to apologise for the wait..."'
        />
      </div>
    </motion.article>
  );
};
