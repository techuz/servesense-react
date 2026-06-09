import { useId } from 'react';
import type { TrendPoint } from '@/lib/mock/performance';

interface TrendChartProps {
  label: string;
  points: TrendPoint[];
  /** Suffix for the current value, e.g. '%' or '/100'. */
  unit?: string;
  accent?: string;
}

const W = 240;
const H = 64;
const PAD_X = 6;
const PAD_Y = 10;

/* A compact line chart for one KPI over the selected window. Null buckets
   (no sessions) are skipped; the line connects the points that exist. */
export const TrendChart = ({ label, points, unit = '', accent = 'var(--ss-green-600)' }: TrendChartProps) => {
  const gid = useId().replace(/:/g, '');
  const defined = points
    .map((p, i) => ({ i, value: p.value }))
    .filter((p): p is { i: number; value: number } => p.value != null);

  const n = points.length;
  const x = (i: number) => PAD_X + (n <= 1 ? 0 : (i / (n - 1)) * (W - PAD_X * 2));
  const y = (v: number) => PAD_Y + (1 - v / 100) * (H - PAD_Y * 2);

  const linePath = defined
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(' ');

  const areaPath =
    defined.length > 1
      ? `${linePath} L ${x(defined[defined.length - 1].i).toFixed(1)} ${H - PAD_Y} L ${x(defined[0].i).toFixed(1)} ${H - PAD_Y} Z`
      : '';

  const last = defined.length ? defined[defined.length - 1].value : null;
  const first = defined.length ? defined[0].value : null;
  const delta = first != null && last != null ? last - first : 0;

  return (
    <div className="ss-trend">
      <div className="ss-trend__head">
        <span className="ss-trend__label">{label}</span>
        <span className="ss-trend__value">
          {last != null ? `${last}${unit}` : '—'}
          {defined.length > 1 && (
            <span className={`ss-trend__delta ss-trend__delta--${delta >= 0 ? 'up' : 'down'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
            </span>
          )}
        </span>
      </div>
      <svg className="ss-trend__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${label} trend`}>
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill={`url(#fill-${gid})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {defined.map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.value)} r="2.4" fill={accent} vectorEffect="non-scaling-stroke" />
        ))}
        {defined.length === 0 && (
          <line x1={PAD_X} y1={H / 2} x2={W - PAD_X} y2={H / 2} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
        )}
      </svg>
    </div>
  );
};
