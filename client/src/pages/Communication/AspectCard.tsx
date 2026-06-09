import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { fadeUp } from '@/lib/motion';
import type { CommAspect } from '@/lib/mock/communication';
import { AspectIcon } from './AspectIcon';

interface Props {
  aspect: CommAspect;
  onEdit: (aspect: CommAspect) => void;
}

export const AspectCard = ({ aspect, onEdit }: Props) => {
  return (
    <motion.article className="ss-comm-aspect" variants={fadeUp} layout>
      <header className="ss-comm-aspect__head">
        <div className="ss-comm-aspect__icon" aria-hidden="true">
          <AspectIcon aspect={aspect.key} />
        </div>
        <div className="ss-comm-aspect__title-block">
          <div className="ss-comm-aspect__title-row">
            <h3 className="ss-comm-aspect__name">{aspect.name}</h3>
            {aspect.purpose && (
              <Badge tone="gold" subtle>
                {aspect.purpose}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <p className="ss-comm-aspect__standard">{aspect.trainedBehavior}</p>

      <div className="ss-comm-aspect__footer">
        <Button variant="ghost" size="sm" onClick={() => onEdit(aspect)}>
          Edit →
        </Button>
      </div>
    </motion.article>
  );
};
