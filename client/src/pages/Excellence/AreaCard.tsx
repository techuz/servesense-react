import { motion } from 'framer-motion';
import { Textarea } from '@/components/primitives/Textarea';
import { PhraseList } from '@/components/primitives/PhraseList';
import { fadeUp } from '@/lib/motion';
import type { ExcellenceAreaData, ExcellenceAreaMeta } from '@/lib/mock/excellence';
import { AreaIcon } from './AreaIcon';

interface Props {
  meta: ExcellenceAreaMeta;
  data: ExcellenceAreaData;
  onChange: (patch: Partial<ExcellenceAreaData>) => void;
}

export const AreaCard = ({ meta, data, onChange }: Props) => {
  return (
    <motion.article className="ss-area" variants={fadeUp} layout>
      <header className="ss-area__head">
        <div className="ss-area__icon" aria-hidden="true">
          <AreaIcon area={meta.key} />
        </div>
        <div className="ss-area__title-block">
          <span className="ss-area__focus">{meta.focus}</span>
          <h3 className="ss-area__name">{meta.name}</h3>
          <p className="ss-area__principle">{meta.principle}</p>
        </div>
      </header>

      <Textarea
        label="Standard"
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
      />

      <PhraseList
        label="Hallmarks of excellence"
        helper="What an exceptional shift looks like — the AI rewards these patterns."
        phrases={data.hallmarks}
        onChange={(next) => onChange({ hallmarks: next })}
        tone="do"
        placeholder="e.g. Water refilled at the 1/3 mark, never the empty mark"
      />

      <PhraseList
        label="Recognition triggers"
        helper="Signals the AI uses to score proactive service during a live session."
        phrases={data.recognitionTriggers}
        onChange={(next) => onChange({ recognitionTriggers: next })}
        tone="avoid"
        placeholder="e.g. guest verbalises surprise: 'oh thank you'"
      />

      <PhraseList
        label="Signature phrases"
        helper="Lines that turn a service moment into a guest memory."
        phrases={data.examplePhrases}
        onChange={(next) => onChange({ examplePhrases: next })}
        tone="quote"
        placeholder='e.g. "I&apos;ll bring extra plates — this is lovely for sharing."'
      />
    </motion.article>
  );
};
