import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { fadeUp } from '@/lib/motion';
import type { ExcellenceArea } from '@/lib/mock/excellence';
import { AreaIcon } from './AreaIcon';

interface Props {
  area: ExcellenceArea;
  onEdit: (area: ExcellenceArea) => void;
}

export const AreaCard = ({ area, onEdit }: Props) => {
  return (
    <motion.article className="ss-area" variants={fadeUp} layout>
      <header className="ss-area__head">
        <div className="ss-area__icon" aria-hidden="true">
          <AreaIcon area={area.key} />
        </div>
        <div className="ss-area__title-block">
          <span className="ss-area__eyebrow">Advanced</span>
          <h3 className="ss-area__name">{area.name}</h3>
        </div>
      </header>

      <p className="ss-area__standard">{area.focus}</p>

      <div className="ss-area__footer">
        <Button variant="ghost" size="sm" onClick={() => onEdit(area)}>
          Edit →
        </Button>
      </div>
    </motion.article>
  );
};
