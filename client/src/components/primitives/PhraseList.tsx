import { KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import './PhraseList.css';

interface PhraseListProps {
  label: string;
  helper?: string;
  phrases: string[];
  onChange?: (next: string[]) => void;
  /** Visual tone — affects chip colour. */
  tone?: 'do' | 'avoid' | 'quote';
  placeholder?: string;
  /** When true, hides the input + remove buttons. Renders as display-only. */
  readOnly?: boolean;
}

export const PhraseList = ({
  label,
  helper,
  phrases,
  onChange,
  tone = 'do',
  placeholder = 'Add a phrase and press Enter',
  readOnly = false,
}: PhraseListProps) => {
  const [draft, setDraft] = useState('');

  const add = () => {
    if (!onChange) return;
    const v = draft.trim();
    if (!v) return;
    if (phrases.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...phrases, v]);
    setDraft('');
  };

  const remove = (idx: number) => {
    if (!onChange) return;
    onChange(phrases.filter((_, i) => i !== idx));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && phrases.length) {
      remove(phrases.length - 1);
    }
  };

  return (
    <div className={cn('ss-phrases', `ss-phrases--${tone}`, readOnly && 'ss-phrases--readonly')}>
      <div className="ss-phrases__head">
        <span className="ss-phrases__label">
          <span className="ss-phrases__icon" aria-hidden="true">
            {tone === 'do' ? '✓' : tone === 'avoid' ? '✕' : '“ ”'}
          </span>
          {label}
        </span>
        {helper && <span className="ss-phrases__helper">{helper}</span>}
      </div>

      <ul className="ss-phrases__list">
        <AnimatePresence initial={false}>
          {phrases.map((p, i) => (
            <motion.li
              key={`${p}-${i}`}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
              className="ss-phrases__item"
            >
              <span className="ss-phrases__text">{p}</span>
              {!readOnly && (
                <button
                  type="button"
                  className="ss-phrases__remove"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${p}`}
                >
                  ×
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!readOnly && (
        <div className="ss-phrases__input-row">
          <input
            type="text"
            className="ss-phrases__input"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={add}
          />
        </div>
      )}
    </div>
  );
};
