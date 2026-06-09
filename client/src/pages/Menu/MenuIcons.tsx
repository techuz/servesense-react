import type { DishType } from '@/lib/mock/menu';

/* --- Veg / Non-veg square mark (regulatory style) ------------------------- */
export const DishMark = ({ type, size = 14 }: { type: DishType; size?: number }) => {
  const color = type === 'veg' ? 'var(--ss-green-700)' : '#b54a3b';

  return (
    <span
      className="ss-mark"
      title={type === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={type === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
      style={
        {
          '--mark-color': color,
          width: `${size}px`,
          height: `${size}px`,
        } as React.CSSProperties
      }
    >
      <span className="ss-mark__dot" aria-hidden="true" />
    </span>
  );
};
