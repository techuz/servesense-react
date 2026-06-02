import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { useAuth } from '@/lib/auth';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  formatINR,
  formatKpi,
  isImproved,
  periodLabels,
  periodOrder,
  useDashboardMetrics,
  type KpiTile,
  type Period,
} from '@/lib/mock/dashboard';
import {
  BarRowChart,
  BeforeAfterBar,
  CategoryDonut,
  Sparkline,
} from './Charts';
import './Dashboard.css';

const categoryColors = [
  'var(--ss-green-700)',
  'var(--ss-gold-500)',
  'var(--ss-green-500)',
  'var(--ss-gold-300)',
  'var(--ss-green-300)',
  'var(--ss-warm-gray-500)',
];

/* --- Per-KPI visual accents --------------------------------------------- */
const kpiAccents: Record<
  KpiTile['key'],
  { tone: 'green' | 'gold' | 'danger'; icon: ReactNode }
> = {
  upsell_success: {
    tone: 'gold',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l6-6 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  avg_order_size: {
    tone: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 6h14l-1.4 11.2A2 2 0 0115.6 19H8.4a2 2 0 01-2-1.8L5 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  customer_satisfaction: {
    tone: 'gold',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.5 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.7L12 2z" />
      </svg>
    ),
  },
  service_errors: {
    tone: 'danger',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  staff_confidence: {
    tone: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const [period, setPeriod] = useState<Period>('30d');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const metrics = useDashboardMetrics(period);

  return (
    <motion.div
      className="ss-dash"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* --- Hero header ----------------------------------------------- */}
      <motion.header className="ss-dash__header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Manager · §2.4</span>
          <h1>Welcome back, {firstName}.</h1>
          <p className="ss-dash__lede">
            ROI, revenue, and service quality at your outlet — refreshed every shift, scoped to
            the window you choose.
          </p>
        </div>
        <div className="ss-dash__header-actions">
          <PeriodPicker period={period} onChange={setPeriod} />
          <Button variant="secondary">Export report</Button>
        </div>
      </motion.header>

      {/* --- Section A: ROI & Business Impact -------------------------- */}
      <motion.section variants={fadeUp} className="ss-dash__section">
        <div className="ss-dash__section-head">
          <div>
            <span className="eyebrow ss-dash__section-eyebrow">A · ROI & Business Impact</span>
            <h2>How much ServeSense is moving the needle</h2>
          </div>
          <Badge tone="brand" subtle dot>
            {periodLabels[period]}
          </Badge>
        </div>

        {/* Hero revenue + before/after side by side */}
        <div className="ss-dash__hero-row">
          <div className="ss-dash__revenue-hero">
            <div className="ss-dash__revenue-spark" aria-hidden="true">
              <Sparkline data={metrics.revenueSparkline} />
            </div>
            <div className="ss-dash__revenue-glow" aria-hidden="true" />
            <div className="ss-dash__revenue-content">
              <span className="ss-dash__hero-eyebrow">Additional revenue · AI-attributable</span>
              <div className="ss-dash__revenue-value">
                {formatINR(metrics.additionalRevenue, true)}
              </div>
              <div className="ss-dash__revenue-meta">
                <span
                  className={cn(
                    'ss-dash__trend',
                    metrics.revenueTrendPct >= 0
                      ? 'ss-dash__trend--up'
                      : 'ss-dash__trend--down',
                  )}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d={
                        metrics.revenueTrendPct >= 0
                          ? 'M12 19V5M5 12l7-7 7 7'
                          : 'M12 5v14M5 12l7 7 7-7'
                      }
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {Math.abs(metrics.revenueTrendPct * 100).toFixed(1)}% vs prior
                </span>
                <span className="ss-dash__revenue-share">
                  {(metrics.additionalRevenuePct * 100).toFixed(1)}% of{' '}
                  {formatINR(metrics.totalRevenue, true)} total
                </span>
              </div>
            </div>
          </div>

          {/* Before/After comparisons */}
          <div className="ss-dash__before-after">
            <div className="ss-dash__ba-head">
              <h3>Before vs after ServeSense</h3>
              <div className="ss-dash__ba-legend" aria-hidden="true">
                <span className="ss-dash__ba-key ss-dash__ba-key--base">Baseline</span>
                <span className="ss-dash__ba-key ss-dash__ba-key--lift">Lift</span>
              </div>
            </div>
            <BeforeAfterBar
              label="Upsell rate"
              before={metrics.upsellRate.before * 100}
              after={metrics.upsellRate.after * 100}
              format={(v) => v.toFixed(1)}
              unit="%"
            />
            <BeforeAfterBar
              label="Avg check size"
              before={metrics.avgCheckSize.before}
              after={metrics.avgCheckSize.after}
              format={(v) => formatINR(Math.round(v))}
            />
          </div>
        </div>

        {/* CoreVista KPI tiles */}
        <div className="ss-dash__kpi-grid">
          {metrics.kpis.map((tile) => (
            <KpiCard key={tile.key} tile={tile} />
          ))}
        </div>
      </motion.section>

      {/* --- Section B: Revenue & Sales Analytics ---------------------- */}
      <motion.section variants={fadeUp} className="ss-dash__section">
        <div className="ss-dash__section-head">
          <div>
            <span className="eyebrow ss-dash__section-eyebrow">B · Revenue & Sales Analytics</span>
            <h2>Where the money is coming from</h2>
          </div>
        </div>

        <div className="ss-dash__analytics">
          <div className="ss-dash__panel">
            <div className="ss-dash__panel-head">
              <h3>Revenue by category</h3>
              <span className="ss-dash__panel-sub">
                {metrics.categoryRevenue.length} categories ·{' '}
                {formatINR(
                  metrics.categoryRevenue.reduce((s, c) => s + c.revenue, 0),
                  true,
                )}
              </span>
            </div>
            <div className="ss-dash__category-body">
              <CategoryDonut
                slices={metrics.categoryRevenue.map((c, i) => ({
                  label: c.categoryName,
                  value: c.revenue,
                  color: categoryColors[i % categoryColors.length],
                }))}
                centerLabel="Total"
                centerValue={formatINR(
                  metrics.categoryRevenue.reduce((s, c) => s + c.revenue, 0),
                  true,
                )}
                hoveredLabel={hoveredCategory}
                onHover={setHoveredCategory}
              />
              <ul
                className="ss-dash__legend"
                role="list"
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {metrics.categoryRevenue.map((c, i) => {
                  const total = metrics.categoryRevenue.reduce((s, x) => s + x.revenue, 0);
                  const pct = c.revenue / total;
                  const isHovered = hoveredCategory === c.categoryName;
                  const isDimmed = hoveredCategory !== null && !isHovered;
                  return (
                    <li
                      key={c.categoryId}
                      className={cn(
                        'ss-dash__legend-row',
                        isHovered && 'ss-dash__legend-row--hover',
                        isDimmed && 'ss-dash__legend-row--dim',
                      )}
                      onMouseEnter={() => setHoveredCategory(c.categoryName)}
                    >
                      <span
                        className="ss-dash__legend-dot"
                        style={{ backgroundColor: categoryColors[i % categoryColors.length] }}
                      />
                      <span className="ss-dash__legend-label">{c.categoryName}</span>
                      <span className="ss-dash__legend-pct">
                        {(pct * 100).toFixed(0)}%
                      </span>
                      <span className="ss-dash__legend-value">
                        {formatINR(c.revenue, true)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="ss-dash__panel">
            <div className="ss-dash__panel-head">
              <h3>Top-selling items</h3>
              <span className="ss-dash__panel-sub">By revenue · top 3</span>
            </div>
            <BarRowChart
              accent="gold"
              rows={metrics.topItems.slice(0, 3).map((item, i) => ({
                id: item.itemId,
                rank: i + 1,
                label: item.itemName,
                value: item.revenue,
                valueText: formatINR(item.revenue, true),
                subText: `${item.units.toLocaleString('en-IN')} sold`,
              }))}
            />
          </div>
        </div>

        {/* Service Errors — clean compact list */}
        <div className="ss-dash__panel ss-dash__panel--errors">
          <div className="ss-dash__panel-head">
            <h3>Service errors</h3>
            <span className="ss-dash__panel-sub">
              SOP misses detected by the AI ·{' '}
              <strong>{metrics.serviceErrors.reduce((s, e) => s + e.count, 0)}</strong> total
            </span>
          </div>
          <ul className="ss-errors" role="list">
            {metrics.serviceErrors.map((err) => (
              <li key={err.type} className="ss-errors__row">
                <div className="ss-errors__text">
                  <span className="ss-errors__type">{err.type}</span>
                  <span className="ss-errors__desc">{err.description}</span>
                </div>
                <span className="ss-errors__count">{err.count}</span>
                <span
                  className={cn(
                    'ss-errors__trend',
                    err.trend < 0
                      ? 'ss-errors__trend--better'
                      : 'ss-errors__trend--worse',
                  )}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d={
                        err.trend < 0
                          ? 'M12 5v14M5 12l7 7 7-7'
                          : 'M12 19V5M5 12l7-7 7 7'
                      }
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {Math.abs(err.trend * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <motion.div className="ss-dash__footer-note" variants={fadeUp}>
        <span className="ss-dash__footer-dot" aria-hidden="true" />
        Metrics are computed from live sessions once the AI service is online — figures shown
        here are illustrative.
      </motion.div>
    </motion.div>
  );
};

const PeriodPicker = ({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) => (
  <div className="ss-dash__period" role="radiogroup" aria-label="Reporting period">
    {periodOrder.map((p) => (
      <button
        key={p}
        type="button"
        role="radio"
        aria-checked={p === period}
        onClick={() => onChange(p)}
        className={cn('ss-dash__period-btn', p === period && 'ss-dash__period-btn--on')}
      >
        {p === period && (
          <motion.span layoutId="ss-dash-period-pill" className="ss-dash__period-pill" />
        )}
        <span className="ss-dash__period-label">{periodLabels[p]}</span>
      </button>
    ))}
  </div>
);

const KpiCard = ({ tile }: { tile: KpiTile }) => {
  const improved = isImproved(tile);
  const delta = tile.current - tile.previous;
  const pct = tile.previous === 0 ? 0 : Math.abs(delta / tile.previous);
  const accent = kpiAccents[tile.key];

  // Mini progress viz: a track showing where we were (previous tick) and where
  // we are now (accent fill). Scaled per unit so every tile reads on its own.
  const scaleMax =
    tile.unit === 'pct'
      ? 100
      : tile.unit === 'rating'
        ? 5
        : Math.max(tile.current, tile.previous) * 1.3;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const fillPct = clamp((tile.current / scaleMax) * 100);
  const tickPct = clamp((tile.previous / scaleMax) * 100);

  return (
    <motion.div
      className={cn('ss-kpi', `ss-kpi--${accent.tone}`)}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ss-kpi__top">
        <div className="ss-kpi__icon" aria-hidden="true">
          {accent.icon}
        </div>
        <span
          className={cn(
            'ss-kpi__trend',
            improved ? 'ss-kpi__trend--up' : 'ss-kpi__trend--down',
          )}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d={improved ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7'}
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {(pct * 100).toFixed(0)}%
        </span>
      </div>
      <span className="ss-kpi__label">{tile.label}</span>
      <div className="ss-kpi__value">{formatKpi(tile, tile.current)}</div>

      <div className="ss-kpi__progress" aria-hidden="true">
        <motion.span
          className="ss-kpi__progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
        <span
          className="ss-kpi__progress-tick"
          style={{ left: `${tickPct}%` }}
          title={`Previous: ${formatKpi(tile, tile.previous)}`}
        />
      </div>

      <div className="ss-kpi__meta">
        <span className="ss-kpi__prev">
          <span className="ss-kpi__prev-dot" aria-hidden="true" />
          From {formatKpi(tile, tile.previous)}
        </span>
        <span className="ss-kpi__helper">{tile.helper}</span>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
