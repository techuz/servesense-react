import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { fadeUp } from '@/lib/motion';
import type { OrientationSource } from './types';
import './OrientationSourceBanner.css';

interface Props {
  source: OrientationSource;
  onReplace: () => void;
  /** Removes the source PDF, returning the page to its empty-upload state. */
  onRemove?: () => void;
  /** Optional override for the action button label. */
  replaceLabel?: string;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export const OrientationSourceBanner = ({
  source,
  onReplace,
  onRemove,
  replaceLabel = 'Replace PDF',
}: Props) => {
  const uploaded = useMemo(() => relativeTime(source.uploadedAt), [source.uploadedAt]);

  return (
    <motion.div className="ss-orient-source" variants={fadeUp}>
      <div className="ss-orient-source__icon" aria-hidden="true">
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
          <path
            d="M3 2h14l5 5v19H3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M17 2v5h5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <text
            x="12"
            y="20"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="6"
            fontWeight="700"
            fill="currentColor"
          >
            PDF
          </text>
        </svg>
      </div>

      <div className="ss-orient-source__body">
        <span className="ss-orient-source__eyebrow">Source document</span>
        <span className="ss-orient-source__name" title={source.filename}>
          {source.filename}
        </span>
        <span className="ss-orient-source__meta">
          Uploaded {uploaded} · {source.pageCount} page{source.pageCount === 1 ? '' : 's'} parsed
        </span>
      </div>

      <div className="ss-orient-source__actions">
        {onRemove && (
          <button
            type="button"
            className="ss-orient-source__remove"
            onClick={onRemove}
            aria-label="Remove source PDF"
            title="Remove PDF — returns to the upload state"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 4h10M5.5 4V2.5h3V4M3.5 4l.5 7.5a1 1 0 001 .9h4a1 1 0 001-.9L10.5 4M6 6.5v4M8 6.5v4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <Button variant="secondary" size="sm" onClick={onReplace}>
          {replaceLabel}
        </Button>
      </div>
    </motion.div>
  );
};
