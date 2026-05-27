import { motion } from 'framer-motion';
import {
  dayLabels,
  dayOrder,
  type OperatingTimings as OperatingTimingsModel,
} from '@/lib/mock/policies';
import { fadeUp } from '@/lib/motion';
import { RulesBlock } from '../Display';

interface Props {
  value: OperatingTimingsModel;
}

function formatTime(hhmm: string): string {
  if (!hhmm) return '—';
  const [hStr, m] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${m} ${period}`;
}

export const OperatingTimingsSection = ({ value }: Props) => (
  <motion.div className="ss-policy-view" variants={fadeUp}>
    <div className="ss-week-schedule" role="table" aria-label="Weekly operating hours">
      <div className="ss-week-schedule__head" role="row">
        <span role="columnheader">Day</span>
        <span role="columnheader">Open</span>
        <span role="columnheader">Close</span>
        <span role="columnheader">Last order</span>
      </div>

      {dayOrder.map((day) => {
        const hours = value.schedule[day];
        return (
          <div
            key={day}
            className={`ss-week-schedule__row ${hours.closed ? 'ss-week-schedule__row--closed' : ''}`}
            role="row"
          >
            <div className="ss-week-schedule__day" role="cell">
              <span className="ss-week-schedule__day-name">{dayLabels[day]}</span>
              {hours.closed && <span className="ss-week-schedule__closed-tag">Closed</span>}
            </div>
            <div className="ss-week-schedule__time" role="cell">
              {hours.closed ? '—' : formatTime(hours.open)}
            </div>
            <div className="ss-week-schedule__time" role="cell">
              {hours.closed ? '—' : formatTime(hours.close)}
            </div>
            <div className="ss-week-schedule__time" role="cell">
              {hours.closed ? '—' : formatTime(hours.lastOrder)}
            </div>
          </div>
        );
      })}
    </div>

    {value.notes && <RulesBlock label="Holiday & seasonal notes" body={value.notes} />}
  </motion.div>
);
