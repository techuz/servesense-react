import { motion } from 'framer-motion';
import { PhraseList } from '@/components/primitives/PhraseList';
import { fadeUp } from '@/lib/motion';
import type { ExcellenceAreaData, ExcellenceAreaMeta } from '@/lib/mock/excellence';
import { AreaIcon } from './AreaIcon';

interface Props {
  meta: ExcellenceAreaMeta;
  data: ExcellenceAreaData;
}

export const AreaCard = ({ meta, data }: Props) => {
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

      {data.description && (
        <p className="ss-area__standard">{data.description}</p>
      )}

      {data.hallmarks.length > 0 && (
        <PhraseList
          label="Hallmarks of excellence"
          helper="What an exceptional shift looks like — the AI rewards these patterns."
          phrases={data.hallmarks}
          tone="do"
          readOnly
        />
      )}

      {data.recognitionTriggers.length > 0 && (
        <PhraseList
          label="Recognition triggers"
          helper="Signals the AI uses to score proactive service during a live session."
          phrases={data.recognitionTriggers}
          tone="avoid"
          readOnly
        />
      )}

      {data.examplePhrases.length > 0 && (
        <PhraseList
          label="Signature phrases"
          helper="Lines that turn a service moment into a guest memory."
          phrases={data.examplePhrases}
          tone="quote"
          readOnly
        />
      )}
    </motion.article>
  );
};
