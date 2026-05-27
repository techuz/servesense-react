import { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { formatINR } from '@/lib/mock/dashboard';

/* ============================================================================
   Inline SVG / div-based charts for the dashboard.
   Keeping these inline (no chart library) so the visual matches the brand
   tightly and the bundle stays small. Trade-off: no interactivity for now.
   ============================================================================ */

/* --- Sparkline ----------------------------------------------------------- */
interface SparklineProps {
  data: number[];
  stroke?: string;
  fill?: string;
  /** Whether to render the endpoint dot. */
  showEndpoint?: boolean;
}

/* Catmull-Rom → cubic Bezier smoothing. Produces a clean curve that doesn't
   distort when stretched horizontally. */
function smoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  if (points.length < 2) return '';
  const out: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    out.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  return out.join(' ');
}

export const Sparkline = ({
  data,
  stroke = 'var(--ss-gold-500)',
  fill = 'var(--ss-gold-100)',
  showEndpoint = true,
}: SparklineProps) => {
  const gradId = useId();
  if (data.length === 0) return null;

  // Fixed-ratio viewBox; non-scaling-stroke keeps lines crisp at any width.
  const VBW = 800;
  const VBH = 200;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 8;
  const padY = 18;
  const innerW = VBW - padX * 2;
  const innerH = VBH - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * innerW;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });

  const linePath = smoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last[0]} ${VBH} L ${first[0]} ${VBH} Z`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Revenue trend sparkline"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.55" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d={linePath}
        stroke={stroke}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      {showEndpoint && (
        <>
          <motion.circle
            cx={last[0]}
            cy={last[1]}
            r="14"
            fill={stroke}
            opacity="0.18"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 20 }}
            style={{ transformOrigin: `${last[0]}px ${last[1]}px` }}
          />
          <motion.circle
            cx={last[0]}
            cy={last[1]}
            r="6"
            fill={stroke}
            stroke="var(--ss-cream-0)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 400, damping: 22 }}
            style={{ transformOrigin: `${last[0]}px ${last[1]}px` }}
          />
        </>
      )}
    </svg>
  );
};

/* --- Horizontal bar row chart ------------------------------------------- */
interface BarRow {
  id: string;
  rank?: number;
  label: string;
  value: number;
  valueText: string;
}

interface BarRowChartProps {
  rows: BarRow[];
  accent?: 'green' | 'gold';
}

export const BarRowChart = ({ rows, accent = 'green' }: BarRowChartProps) => {
  const max = useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.value), 0) || 1,
    [rows],
  );

  return (
    <ul className="ss-bars" role="list">
      {rows.map((row, i) => {
        const pct = row.value / max;
        return (
          <motion.li
            key={row.id}
            className="ss-bars__row"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.05 }}
          >
            <div className="ss-bars__row-head">
              <div className="ss-bars__label-block">
                {row.rank != null && (
                  <span className="ss-bars__rank">{row.rank.toString().padStart(2, '0')}</span>
                )}
                <span className="ss-bars__label">{row.label}</span>
              </div>
              <span className="ss-bars__value">{row.valueText}</span>
            </div>
            <div className="ss-bars__track">
              <motion.div
                className={`ss-bars__fill ss-bars__fill--${accent}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 + i * 0.05,
                }}
              />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
};

/* --- Before/After delta visualizer -------------------------------------- */
interface BeforeAfterProps {
  label: string;
  before: number;
  after: number;
  format: (n: number) => string;
  unit?: string;
}

export const BeforeAfterBar = ({
  label,
  before,
  after,
  format,
  unit,
}: BeforeAfterProps) => {
  const max = Math.max(before, after) || 1;
  const beforePct = (before / max) * 100;
  const afterPct = (after / max) * 100;
  const deltaPct = before === 0 ? 0 : ((after - before) / before) * 100;
  const improved = after > before;

  return (
    <div className="ss-ba">
      <div className="ss-ba__head">
        <span className="ss-ba__label">{label}</span>
        <span className={`ss-ba__delta ${improved ? 'ss-ba__delta--up' : 'ss-ba__delta--down'}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d={improved ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7'}
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {Math.abs(deltaPct).toFixed(0)}%
        </span>
      </div>
      <div className="ss-ba__row">
        <div className="ss-ba__tier ss-ba__tier--before">
          <span className="ss-ba__tier-tag">Before</span>
          <span className="ss-ba__tier-value">
            {format(before)}
            {unit && <span className="ss-ba__tier-unit">{unit}</span>}
          </span>
          <div className="ss-ba__bar">
            <motion.div
              className="ss-ba__bar-fill ss-ba__bar-fill--before"
              initial={{ width: 0 }}
              animate={{ width: `${beforePct}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <div className="ss-ba__tier ss-ba__tier--after">
          <span className="ss-ba__tier-tag">After ServeSense</span>
          <span className="ss-ba__tier-value">
            {format(after)}
            {unit && <span className="ss-ba__tier-unit">{unit}</span>}
          </span>
          <div className="ss-ba__bar">
            <motion.div
              className="ss-ba__bar-fill ss-ba__bar-fill--after"
              initial={{ width: 0 }}
              animate={{ width: `${afterPct}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Donut breakdown for category share --------------------------------- */
interface CategoryDonutProps {
  slices: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
  /** Optional: called when a slice is hovered (so legend can highlight). */
  onHover?: (label: string | null) => void;
  /** Externally-controlled hovered slice (e.g. from legend row hover). */
  hoveredLabel?: string | null;
}

export const CategoryDonut = ({
  slices,
  centerLabel,
  centerValue,
  onHover,
  hoveredLabel,
}: CategoryDonutProps) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const hovered = hoveredLabel !== undefined ? hoveredLabel : internalHover;

  const total = slices.reduce((s, v) => s + v.value, 0) || 1;
  const size = 200;
  const stroke = 24;
  const r = size / 2 - stroke / 2;
  const circ = 2 * Math.PI * r;
  let accumulated = 0;

  const setHover = (label: string | null) => {
    if (hoveredLabel === undefined) setInternalHover(label);
    onHover?.(label);
  };

  const activeSlice = slices.find((s) => s.label === hovered);
  const displayedLabel = activeSlice
    ? activeSlice.label.split('·')[0].trim()
    : centerLabel === 'Top'
      ? 'Top'
      : centerLabel;
  const displayedValue = activeSlice
    ? `${Math.round((activeSlice.value / total) * 100)}%`
    : centerValue;
  const displayedSub = activeSlice ? activeSlice.label : null;

  return (
    <div className="ss-donut">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseLeave={() => setHover(null)}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ss-warm-gray-100)"
          strokeWidth={stroke}
        />
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dashLen = frac * circ;
          const dashOffset = -accumulated * circ;
          accumulated += frac;
          const isHovered = hovered === s.label;
          return (
            <motion.circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
              style={{
                cursor: 'pointer',
                filter: isHovered ? `drop-shadow(0 0 8px ${s.color})` : 'none',
                transition: 'filter 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={() => setHover(s.label)}
            />
          );
        })}
        <text
          x="50%"
          y={displayedSub ? '42%' : '48%'}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--ss-warm-gray-500)"
          fontWeight="600"
          letterSpacing="0.04em"
          style={{ textTransform: 'uppercase' }}
        >
          {displayedSub ? 'Share' : displayedLabel}
        </text>
        <text
          x="50%"
          y={displayedSub ? '56%' : '60%'}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-serif)"
          fontSize="26"
          fill="var(--ss-green-900)"
          letterSpacing="-0.03em"
        >
          {displayedValue}
        </text>
        {displayedSub && (
          <text
            x="50%"
            y="68%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-sans)"
            fontSize="10"
            fill="var(--ss-warm-gray-500)"
            fontWeight="500"
            style={{ pointerEvents: 'none' }}
          >
            {displayedSub.length > 22 ? displayedSub.slice(0, 20) + '…' : displayedSub}
          </text>
        )}
      </svg>
    </div>
  );
};

/* --- Number formatting passthrough -------------------------------------- */
export { formatINR };
