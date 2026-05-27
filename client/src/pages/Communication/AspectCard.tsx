import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Textarea } from '@/components/primitives/Textarea';
import { PhraseList } from '@/components/primitives/PhraseList';
import { fadeUp } from '@/lib/motion';
import type { CommAspectData, CommAspectMeta } from '@/lib/mock/communication';
import { AspectIcon } from './AspectIcon';

interface Props {
  meta: CommAspectMeta;
  data: CommAspectData;
  onChange: (patch: Partial<CommAspectData>) => void;
}

export const AspectCard = ({ meta, data, onChange }: Props) => {
  return (
    <motion.article className="ss-comm-aspect" variants={fadeUp} layout>
      <header className="ss-comm-aspect__head">
        <div className="ss-comm-aspect__icon" aria-hidden="true">
          <AspectIcon aspect={meta.key} />
        </div>
        <div className="ss-comm-aspect__title-block">
          <div className="ss-comm-aspect__title-row">
            <h3 className="ss-comm-aspect__name">{meta.name}</h3>
            <Badge tone="gold" subtle>
              {meta.purpose}
            </Badge>
          </div>
          <span className="ss-comm-aspect__behaviour">{meta.trainedBehaviour}</span>
        </div>
      </header>

      <Textarea
        label="Standard"
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
      />

      <div className="ss-comm-aspect__lists">
        <PhraseList
          label="Principles"
          helper="What good looks like — signals the AI rewards."
          phrases={data.principles}
          onChange={(next) => onChange({ principles: next })}
          tone="do"
          placeholder="e.g. Speak slightly slower than the guest"
        />
        <PhraseList
          label="Red flags"
          helper="Patterns the AI flags as deviations during the live session."
          phrases={data.redFlags}
          onChange={(next) => onChange({ redFlags: next })}
          tone="avoid"
          placeholder="e.g. Sighing audibly when busy"
        />
      </div>

      <PhraseList
        label="Example phrases"
        helper="Sample lines the AI can suggest in real time."
        phrases={data.examplePhrases}
        onChange={(next) => onChange({ examplePhrases: next })}
        tone="quote"
        placeholder='e.g. "Of course, let me take care of that right away."'
      />
    </motion.article>
  );
};
