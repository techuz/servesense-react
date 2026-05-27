import { KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import './TimePicker.css';

export interface TimePickerProps {
  /** 24-hour "HH:MM" string. Empty string means unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

type Period = 'AM' | 'PM';

interface Parts {
  hour: number;   // 1–12
  minute: number; // 0–59
  period: Period;
}

const DEFAULT_PARTS: Parts = { hour: 12, minute: 0, period: 'PM' };

const QUICK_TIMES: Array<{ label: string; v: string }> = [
  { label: '10:00 AM', v: '10:00' },
  { label: '11:00 AM', v: '11:00' },
  { label: '12:00 PM', v: '12:00' },
  { label: '6:00 PM',  v: '18:00' },
  { label: '11:00 PM', v: '23:00' },
  { label: '11:30 PM', v: '23:30' },
];

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 360; // upper bound for flip-detection
const GAP = 6;

function parse24(value: string): Parts | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const h24 = Number(match[1]);
  const minute = Number(match[2]);
  if (h24 < 0 || h24 > 23 || minute < 0 || minute > 59) return null;
  const period: Period = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour, minute, period };
}

function format24({ hour, minute, period }: Parts): string {
  let h24 = hour % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function format12(value: string, placeholder: string): string {
  const parsed = parse24(value);
  if (!parsed) return placeholder;
  return `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.period}`;
}

interface PopoverPosition {
  top: number;
  left: number;
  origin: 'top left' | 'bottom left';
}

export const TimePicker = ({
  value,
  onChange,
  disabled,
  placeholder = 'Select time',
  'aria-label': ariaLabel,
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPosition>({ top: 0, left: 0, origin: 'top left' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const parts = useMemo(() => parse24(value) ?? DEFAULT_PARTS, [value]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipAbove = spaceBelow < POPOVER_HEIGHT + GAP && rect.top > POPOVER_HEIGHT + GAP;

    // Keep popover horizontally inside the viewport
    let left = rect.left;
    if (left + POPOVER_WIDTH + 8 > window.innerWidth) {
      left = Math.max(8, window.innerWidth - POPOVER_WIDTH - 8);
    }
    left = Math.max(8, left);

    setPos({
      top: flipAbove ? rect.top - GAP : rect.bottom + GAP,
      left,
      origin: flipAbove ? 'bottom left' : 'top left',
    });
  }, []);

  // Recompute position when we open, and again right after the popover mounts
  // (so transforms originate from the right side when flipped).
  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Keep position in sync with scroll & resize while open.
  useEffect(() => {
    if (!open) return;

    const onScrollResize = () => updatePosition();
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);

    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent | Event) => {
      if ((e as KeyboardEvent).key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey as EventListener);

    return () => {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey as EventListener);
    };
  }, [open, updatePosition]);

  const commit = (patch: Partial<Parts>) => {
    onChange(format24({ ...parts, ...patch }));
  };

  // Translate offset so that when flipped above, popover sits with its bottom
  // edge at the calculated top (which equals trigger's top minus gap).
  const transformY = pos.origin === 'bottom left' ? '-100%' : '0';

  return (
    <div className={cn('ss-time', disabled && 'ss-time--disabled')}>
      <button
        ref={triggerRef}
        type="button"
        className={cn('ss-time__trigger', open && 'ss-time__trigger--open', !value && 'ss-time__trigger--empty')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ss-time__value">{format12(value, placeholder)}</span>
        <svg
          className="ss-time__icon"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 4.5V8l2.4 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popRef}
              className="ss-time__pop"
              role="dialog"
              aria-label="Select time"
              initial={{ opacity: 0, y: pos.origin === 'top left' ? -4 : 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: pos.origin === 'top left' ? -4 : 4,
                scale: 0.97,
                transition: { duration: 0.12 },
              }}
              transition={transitions.softSpring}
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                width: POPOVER_WIDTH,
                transform: `translateY(${transformY})`,
                transformOrigin: pos.origin,
              }}
            >
              <div className="ss-time__section-label">Common times</div>
              <div className="ss-time__quick">
                {QUICK_TIMES.map((q) => (
                  <button
                    key={q.v}
                    type="button"
                    className={cn('ss-time__quick-btn', value === q.v && 'ss-time__quick-btn--on')}
                    onClick={() => {
                      onChange(q.v);
                      setOpen(false);
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <div className="ss-time__divider">
                <span>or set custom</span>
              </div>

              <div className="ss-time__editor">
                <Stepper
                  value={parts.hour}
                  min={1}
                  max={12}
                  step={1}
                  onChange={(h) => commit({ hour: h })}
                  label="Hour"
                />
                <span className="ss-time__colon" aria-hidden="true">:</span>
                <Stepper
                  value={parts.minute}
                  min={0}
                  max={55}
                  step={5}
                  wrap
                  onChange={(m) => commit({ minute: m })}
                  label="Minute"
                  pad
                />
                <PeriodToggle period={parts.period} onChange={(p) => commit({ period: p })} />
              </div>

              <div className="ss-time__footer">
                <button
                  type="button"
                  className="ss-time__shortcut"
                  onClick={() => {
                    const now = new Date();
                    const h24 = now.getHours();
                    const m = Math.round(now.getMinutes() / 5) * 5;
                    onChange(`${String(h24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
                  }}
                >
                  Set to now
                </button>
                <button type="button" className="ss-time__done" onClick={() => setOpen(false)}>
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

/* --- Stepper (hour / minute) -------------------------------------------- */

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  wrap?: boolean;
  pad?: boolean;
  label: string;
  onChange: (n: number) => void;
}

const Stepper = ({ value, min, max, step, wrap, pad, label, onChange }: StepperProps) => {
  const clamp = (n: number) => {
    if (wrap) {
      if (n > max) return min;
      if (n < min) return max;
      return n;
    }
    return Math.max(min, Math.min(max, n));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(value + step));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(value - step));
    }
  };

  return (
    <div className="ss-time-step" role="group" aria-label={label}>
      <button
        type="button"
        className="ss-time-step__btn ss-time-step__btn--up"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(clamp(value + step))}
      >
        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 3l3 4H2z" fill="currentColor" /></svg>
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        className="ss-time-step__input"
        value={pad ? String(value).padStart(2, '0') : String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '');
          if (!digits) return;
          onChange(clamp(Number(digits)));
        }}
        onKeyDown={handleKey}
        aria-label={label}
      />
      <button
        type="button"
        className="ss-time-step__btn ss-time-step__btn--dn"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(clamp(value - step))}
      >
        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 7L2 3h6z" fill="currentColor" /></svg>
      </button>
    </div>
  );
};

/* --- AM/PM sliding toggle ----------------------------------------------- */

const PeriodToggle = ({ period, onChange }: { period: Period; onChange: (p: Period) => void }) => (
  <div className="ss-time-period" role="group" aria-label="AM or PM">
    <motion.span
      className="ss-time-period__slider"
      layout
      transition={{ type: 'spring', stiffness: 600, damping: 36 }}
      data-side={period}
    />
    {(['AM', 'PM'] as Period[]).map((p) => (
      <button
        key={p}
        type="button"
        className={cn('ss-time-period__btn', period === p && 'ss-time-period__btn--on')}
        onClick={() => onChange(p)}
      >
        {p}
      </button>
    ))}
  </div>
);
