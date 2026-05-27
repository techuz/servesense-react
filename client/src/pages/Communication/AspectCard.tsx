import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { PhraseList } from '@/components/primitives/PhraseList';
import { fadeUp } from '@/lib/motion';
import type { CommAspectData, CommAspectMeta } from '@/lib/mock/communication';
import { AspectIcon } from './AspectIcon';

interface Props {
  meta: CommAspectMeta;
  data: CommAspectData;
}

export const AspectCard = ({ meta, data }: Props) => {
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

      {data.description && (
        <p className="ss-comm-aspect__standard">{data.description}</p>
      )}

      <div className="ss-comm-aspect__lists">
        {data.principles.length > 0 && (
          <PhraseList
            label="Principles"
            helper="What good looks like — signals the AI rewards."
            phrases={data.principles}
            tone="do"
            readOnly
          />
        )}
        {data.redFlags.length > 0 && (
          <PhraseList
            label="Red flags"
            helper="Patterns the AI flags as deviations during the live session."
            phrases={data.redFlags}
            tone="avoid"
            readOnly
          />
        )}
      </div>

      {data.examplePhrases.length > 0 && (
        <PhraseList
          label="Example phrases"
          helper="Sample lines the AI can suggest in real time."
          phrases={data.examplePhrases}
          tone="quote"
          readOnly
        />
      )}
    </motion.article>
  );
};
