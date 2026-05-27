import { motion } from 'framer-motion';
import { Switch } from '@/components/primitives/Switch';
import { Textarea } from '@/components/primitives/Textarea';
import { TimePicker } from '@/components/primitives/TimePicker';
import {
  dayLabels,
  dayOrder,
  type DayKey,
  type OperatingTimings as OperatingTimingsModel,
} from '@/lib/mock/policies';
import { fadeUp } from '@/lib/motion';

interface Props {
  value: OperatingTimingsModel;
  onChange: (patch: Partial<OperatingTimingsModel>) => void;
}

export const OperatingTimingsSection = ({ value, onChange }: Props) => {
  const updateDay = (day: DayKey, patch: Partial<OperatingTimingsModel['schedule'][DayKey]>) => {
    onChange({
      schedule: {
        ...value.schedule,
        [day]: { ...value.schedule[day], ...patch },
      },
    });
  };

  return (
    <motion.div className="ss-policy-form" variants={fadeUp}>
      <div className="ss-week-schedule" role="table" aria-label="Weekly operating hours">
        <div className="ss-week-schedule__head" role="row">
          <span role="columnheader">Day</span>
          <span role="columnheader">Open</span>
          <span role="columnheader">Close</span>
          <span role="columnheader">Last order</span>
        </div>

        {dayOrder.map((day) => {
          const hours = value.schedule[day];
          const open = !hours.closed;
          return (
            <div
              key={day}
              className={`ss-week-schedule__row ${hours.closed ? 'ss-week-schedule__row--closed' : ''}`}
              role="row"
            >
              <div className="ss-week-schedule__day" role="cell">
                <Switch
                  checked={open}
                  size="sm"
                  onChange={(on) => updateDay(day, { closed: !on })}
                  label={dayLabels[day]}
                />
              </div>

              <div role="cell">
                <TimePicker
                  value={hours.open}
                  disabled={hours.closed}
                  onChange={(v) => updateDay(day, { open: v })}
                  aria-label={`${dayLabels[day]} opening time`}
                  placeholder="—"
                />
              </div>

              <div role="cell">
                <TimePicker
                  value={hours.close}
                  disabled={hours.closed}
                  onChange={(v) => updateDay(day, { close: v })}
                  aria-label={`${dayLabels[day]} closing time`}
                  placeholder="—"
                />
              </div>

              <div role="cell">
                <TimePicker
                  value={hours.lastOrder}
                  disabled={hours.closed}
                  onChange={(v) => updateDay(day, { lastOrder: v })}
                  aria-label={`${dayLabels[day]} last order time`}
                  placeholder="—"
                />
              </div>
            </div>
          );
        })}
      </div>

      <Textarea
        label="Holiday & seasonal notes"
        value={value.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        hint="Anything outside the weekly schedule — national holidays, festival hours, off-season closures."
        rows={3}
      />
    </motion.div>
  );
};
