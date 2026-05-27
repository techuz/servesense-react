import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { PhraseList } from '@/components/primitives/PhraseList';
import { fadeUp } from '@/lib/motion';
import {
  situationCategoryLabels,
  type DifficultSituation,
} from '@/lib/mock/communication';

interface Props {
  situation: DifficultSituation;
}

export const SituationCard = ({ situation }: Props) => {
  return (
    <motion.article className="ss-situation" variants={fadeUp} layout>
      <header className="ss-situation__head">
        <div className="ss-situation__title-block">
          <Badge tone="warning" subtle>
            {situationCategoryLabels[situation.category]}
          </Badge>
          <h3 className="ss-situation__title">{situation.title}</h3>
        </div>
      </header>

      {situation.context && (
        <p className="ss-situation__context">{situation.context}</p>
      )}

      <div className="ss-situation__lists">
        {situation.triggerSignals.length > 0 && (
          <PhraseList
            label="Trigger signals"
            helper="Keywords or behaviours the AI listens for to detect this scenario."
            phrases={situation.triggerSignals}
            tone="avoid"
            readOnly
          />
        )}
        {situation.recoveryPhrases.length > 0 && (
          <PhraseList
            label="Recovery phrases"
            helper="Lines the AI surfaces in real time when this scenario is detected."
            phrases={situation.recoveryPhrases}
            tone="quote"
            readOnly
          />
        )}
      </div>
    </motion.article>
  );
};
