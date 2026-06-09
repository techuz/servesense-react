import { DragEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { simulateExtraction, type MenuCategory, type MenuItem } from '@/lib/mock/menu';
import { MenuItemForm } from './MenuItemForm';

interface MenuUploadDrawerProps {
  open: boolean;
  categories: MenuCategory[];
  onClose: () => void;
  onImport: (items: MenuItem[]) => void;
}

type Phase = 'drop' | 'processing' | 'review';

const ACCEPTED = ['.pdf', '.docx', '.xlsx', '.csv'];

export const MenuUploadDrawer = ({ open, categories, onClose, onImport }: MenuUploadDrawerProps) => {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('drop');
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('drop');
      setFilename('');
      setItems([]);
      setExpanded(null);
    }
  }, [open]);

  const handleFile = async (file: File) => {
    const ok = ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!ok) {
      notify({ tone: 'error', title: 'Unsupported file', description: 'Upload a PDF, DOCX, XLSX, or CSV menu file (max 10 MB).' });
      return;
    }
    setFilename(file.name);
    setPhase('processing');
    const extracted = await simulateExtraction(file.name);
    setItems(extracted);
    setExpanded(extracted[0]?.id ?? null);
    setPhase('review');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const ready = (it: MenuItem) => it.allergens.length > 0 || it.allergensConfirmed;
  const allReady = items.length > 0 && items.every(ready);
  const pending = items.filter((it) => !ready(it)).length;

  const saveItem = (saved: MenuItem) => {
    setItems((list) => list.map((it) => (it.id === saved.id ? saved : it)));
    // Jump to the next item still needing review, if any.
    const next = items.find((it) => it.id !== saved.id && !ready(it));
    setExpanded(next ? next.id : null);
  };

  const removeItem = (id: string) => {
    setItems((list) => list.filter((it) => it.id !== id));
    setExpanded(null);
  };

  const handleImport = () => {
    if (!allReady) {
      notify({ tone: 'error', title: 'Review remaining items', description: `${pending} item${pending === 1 ? '' : 's'} still need allergens before import.` });
      return;
    }
    onImport(items.map((it) => ({ ...it, allergensConfirmed: true })));
    notify({ tone: 'success', title: `${items.length} item${items.length === 1 ? '' : 's'} added`, description: 'They’re live in your menu now.' });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Upload menu"
      size="lg"
      description={phase === 'review' ? 'Review each extracted item in the same form you use to add or edit — fields are pre-filled from your file.' : undefined}
    >
      <div className="ss-menu-upload">
        <AnimatePresence mode="wait">
          {phase === 'drop' && (
            <motion.div key="drop" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={transitions.base}>
              <div
                className={cn('ss-menu-upload__drop', dragOver && 'ss-menu-upload__drop--over')}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <motion.div
                  className="ss-menu-upload__icon"
                  animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                >
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <div className="ss-menu-upload__copy">
                  <h3>Drop your menu file</h3>
                  <p>or click to browse — we extract dish names, descriptions, prices, and categories.</p>
                </div>
                <div className="ss-menu-upload__formats">PDF · DOCX · XLSX · CSV · max 10 MB</div>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="processing" className="ss-menu-upload__processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ss-menu-upload__visual">
                <motion.div className="ss-menu-upload__ring" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
                <div className="ss-menu-upload__doc" aria-hidden="true">
                  <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
                    <path d="M4 4h22l10 10v30H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M26 4v10h10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    {[20, 26, 32].map((y, i) => (
                      <motion.path
                        key={i}
                        d={`M10 ${y}h20`}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
              <h3>Reading {filename}…</h3>
              <p>Extracting menu items from the document.</p>
              <motion.ul className="ss-menu-upload__steps" variants={stagger(0.25, 0.2)} initial="hidden" animate="visible">
                <motion.li variants={fadeUp}>Scanning pages…</motion.li>
                <motion.li variants={fadeUp}>Detecting dishes & prices…</motion.li>
                <motion.li variants={fadeUp}>Structuring for review…</motion.li>
              </motion.ul>
            </motion.div>
          )}

          {phase === 'review' && (
            <motion.div key="review" className="ss-menu-upload__review" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="ss-menu-upload__review-head">
                <div>
                  <strong>{items.length}</strong> item{items.length === 1 ? '' : 's'} extracted from {filename}
                </div>
                <span className={cn('ss-menu-upload__gate', allReady && 'ss-menu-upload__gate--ok')}>
                  {allReady ? 'All reviewed' : `${pending} to review`}
                </span>
              </div>

              <ul className="ss-menu-upload__list">
                {items.map((it) => {
                  const isOpen = expanded === it.id;
                  const ok = ready(it);
                  return (
                    <li key={it.id} className={cn('ss-review-item', !ok && 'ss-review-item--needs', isOpen && 'ss-review-item--open')}>
                      <button type="button" className="ss-review-item__head" onClick={() => setExpanded(isOpen ? null : it.id)}>
                        <div className="ss-review-item__title">
                          <span className="ss-review-item__name">{it.name}</span>
                          <span className="ss-review-item__price">${it.price}</span>
                        </div>
                        <span className={cn('ss-review-item__flag', ok && 'ss-review-item__flag--ok')}>
                          {ok ? '✓ Reviewed' : 'Needs review'}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            className="ss-review-item__body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={transitions.base}
                          >
                            <MenuItemForm
                              key={it.id}
                              item={it}
                              categories={categories}
                              submitLabel="Save item"
                              variant="inline"
                              onSave={saveItem}
                              onCancel={() => setExpanded(null)}
                              onDelete={removeItem}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              <div className="ss-menu-upload__actions">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleImport} disabled={!allReady}>
                  Add {items.length} item{items.length === 1 ? '' : 's'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
};
