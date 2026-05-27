import { cn } from '@/lib/cn';
import type { DishType, SpiceLevel } from '@/lib/mock/menu';

/* --- Veg / Non-veg square mark (Indian regulatory style) ----------------- */
export const DishMark = ({ type, size = 14 }: { type: DishType; size?: number }) => {
  const color = {
    veg: 'var(--ss-green-700)',
    vegan: 'var(--ss-green-700)',
    egg: '#d6a93c',
    'non-veg': '#b54a3b',
    seafood: '#3a7ab5',
  }[type];

  return (
    <span
      className="ss-mark"
      title={type}
      aria-label={type}
      style={
        {
          '--mark-color': color,
          width: `${size}px`,
          height: `${size}px`,
        } as React.CSSProperties
      }
    >
      {type === 'vegan' ? (
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M6 1c-2 1.5-3 3-3 5.2 0 1.7 1.3 3.3 3 3.3s3-1.6 3-3.3C9 4 8 2.5 6 1zm0 1.6c1.2 1 2 2 2 3.6 0 1.1-.9 2.1-2 2.1s-2-1-2-2.1c0-1.6.8-2.6 2-3.6z"
            fill="var(--mark-color)"
          />
        </svg>
      ) : (
        <span className="ss-mark__dot" aria-hidden="true" />
      )}
    </span>
  );
};

/* --- Spice level meter (1-4 flame indicators) ---------------------------- */
const spiceCount: Record<SpiceLevel, number> = {
  none: 0,
  mild: 1,
  medium: 2,
  hot: 3,
  fiery: 4,
};

export const SpiceMeter = ({ level }: { level: SpiceLevel }) => {
  if (level === 'none') {
    return (
      <span className="ss-spice ss-spice--none" title="No heat">
        <span className="ss-spice__label">Mild</span>
      </span>
    );
  }
  const count = spiceCount[level];
  return (
    <span className={cn('ss-spice', `ss-spice--${level}`)} title={`Spice: ${level}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Flame key={i} active={i < count} />
      ))}
    </span>
  );
};

const Flame = ({ active }: { active: boolean }) => (
  <svg
    className={cn('ss-spice__flame', active && 'ss-spice__flame--on')}
    width="10"
    height="12"
    viewBox="0 0 10 12"
    aria-hidden="true"
  >
    <path
      d="M5 .5c.5 1.5 2.4 2.7 2.4 4.9 0 1.7-1.1 3.1-2.4 3.4-.4-.6-.5-1.5-.2-2.1C3.3 7.3 2.6 6 2.6 4.8 2.6 3 4.2 1.8 5 .5z"
      fill="currentColor"
    />
    <path
      d="M5 5.6c.6.7 1.4 1.7 1.4 2.9 0 1.4-1.1 2.5-2.5 2.5S1.4 9.9 1.4 8.5c0-1.2.8-2.2 1.4-2.9.1.6.5 1 1 1s.9-.4 1.2-1z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);
