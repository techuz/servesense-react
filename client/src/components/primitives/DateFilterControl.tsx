import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  datePresetLabels,
  datePresetOrder,
  describeDateFilter,
  type DateFilter,
  type DatePreset,
} from '@/lib/mock/performance';
import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import './DateFilterControl.css';

interface Props {
  value: DateFilter;
  onChange: (next: DateFilter) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function offsetIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const DateFilterControl = ({ value, onChange }: Props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; flipUp: boolean }>({
    top: 0,
    left: 0,
    flipUp: false,
  });

  /* Position popover beneath trigger; flip above when there isn't room. */
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const trig = triggerRef.current.getBoundingClientRect();
    const PANEL_W = 280;
    const PANEL_H = value.kind === 'custom' ? 480 : 410;
    const margin = 8;
    const flipUp = trig.bottom + PANEL_H + margin > window.innerHeight;
    const top = flipUp ? trig.top - PANEL_H - margin : trig.bottom + margin;
    let left = trig.right - PANEL_W;
    if (left < margin) left = margin;
    if (left + PANEL_W > window.innerWidth - margin) {
      left = window.innerWidth - PANEL_W - margin;
    }
    setPos({ top, left, flipUp });
  }, [open, value.kind]);

  /* Close on outside-click + ESC */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!popoverRef.current || !triggerRef.current) return;
      if (
        popoverRef.current.contains(e.target as Node) ||
        triggerRef.current.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label = useMemo(() => describeDateFilter(value), [value]);
  const isCustom = value.kind === 'custom';

  const pickPreset = (preset: DatePreset) => {
    onChange({ kind: 'preset', preset });
  };

  const enterCustom = () => {
    if (value.kind === 'custom') return;
    onChange({ kind: 'custom', from: offsetIso(7), to: todayIso() });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn('ss-datefilter__trigger', open && 'ss-datefilter__trigger--open')}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="ss-datefilter__trigger-label">{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={cn('ss-datefilter__chev', open && 'ss-datefilter__chev--open')}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              className="ss-datefilter__popover"
              role="dialog"
              aria-label="Date filter"
              style={{ top: pos.top, left: pos.left }}
              initial={{ opacity: 0, y: pos.flipUp ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.flipUp ? 6 : -6, scale: 0.98 }}
              transition={transitions.base}
            >
              <div className="ss-datefilter__list" role="listbox">
                {datePresetOrder.map((preset) => {
                  const isActive =
                    value.kind === 'preset' && value.preset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => pickPreset(preset)}
                      className={cn(
                        'ss-datefilter__item',
                        isActive && 'ss-datefilter__item--on',
                      )}
                    >
                      <span className="ss-datefilter__item-label">
                        {datePresetLabels[preset]}
                      </span>
                      {isActive && (
                        <span className="ss-datefilter__item-check" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 14 14">
                            <path
                              d="M3 7.5l2.8 2.8L11 4.6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="ss-datefilter__divider" aria-hidden="true" />

                <button
                  type="button"
                  role="option"
                  aria-selected={isCustom}
                  onClick={enterCustom}
                  className={cn(
                    'ss-datefilter__item',
                    isCustom && 'ss-datefilter__item--on',
                  )}
                >
                  <span className="ss-datefilter__item-label">
                    Custom range…
                  </span>
                  {isCustom && (
                    <span className="ss-datefilter__item-check" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path
                          d="M3 7.5l2.8 2.8L11 4.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isCustom && value.kind === 'custom' && (
                    <motion.div
                      key="custom-inputs"
                      className="ss-datefilter__custom"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={transitions.base}
                    >
                      <label className="ss-datefilter__field">
                        <span>From</span>
                        <input
                          type="date"
                          value={value.from}
                          max={value.to}
                          onChange={(e) =>
                            onChange({
                              kind: 'custom',
                              from: e.target.value || value.from,
                              to: value.to,
                            })
                          }
                        />
                      </label>
                      <label className="ss-datefilter__field">
                        <span>To</span>
                        <input
                          type="date"
                          value={value.to}
                          min={value.from}
                          max={todayIso()}
                          onChange={(e) =>
                            onChange({
                              kind: 'custom',
                              from: value.from,
                              to: e.target.value || value.to,
                            })
                          }
                        />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
