import { useCallback, useRef, useState, DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import { Badge } from '@/components/primitives/Badge';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { useToast } from '@/lib/toast';
import {
  dishTypeLabels,
  simulateExtraction,
  type MenuCategory,
  type MenuItem,
} from '@/lib/mock/menu';
import { cn } from '@/lib/cn';
import { DishMark } from './MenuIcons';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  currency: string;
  onImport: (items: MenuItem[]) => void;
}

type Phase = 'drop' | 'processing' | 'review';

export const UploadDrawer = ({ open, onClose, categories, currency, onImport }: Props) => {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>('drop');
  const [filename, setFilename] = useState<string>('');
  const [extracted, setExtracted] = useState<MenuItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reset = () => {
    setPhase('drop');
    setFilename('');
    setExtracted([]);
    setSelected(new Set());
  };

  const handleClose = () => {
    onClose();
    // Small delay so the drawer slide-out doesn't visually flash a reset state
    setTimeout(reset, 280);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      notify({
        tone: 'error',
        title: 'PDF required',
        description: 'Upload your menu as a PDF — we extract structured items from it.',
      });
      return;
    }
    setFilename(file.name);
    setPhase('processing');

    const items = await simulateExtraction(file.name);
    setExtracted(items);
    setSelected(new Set(items.map((i) => i.id)));
    setPhase('review');
  }, [notify]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const importNow = () => {
    const chosen = extracted.filter((i) => selected.has(i.id));
    onImport(chosen);
    notify({
      tone: 'success',
      title: `${chosen.length} item${chosen.length === 1 ? '' : 's'} imported`,
      description: `Added from ${filename}`,
    });
    handleClose();
  };

  const lookupCategory = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorised';

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Upload menu PDF"
      description="We'll extract dishes, prices, and ingredients automatically. You review and edit before anything is added."
      size="lg"
      footer={
        phase === 'review' ? (
          <>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                reset();
              }}
            >
              Upload another
            </Button>
            <Button variant="primary" onClick={importNow} disabled={selected.size === 0}>
              Import {selected.size} item{selected.size === 1 ? '' : 's'}
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'drop' && (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transitions.base}
          >
            <div
              className={cn('ss-upload-drop', dragOver && 'ss-upload-drop--over')}
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
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <motion.div
                className="ss-upload-drop__icon"
                animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div className="ss-upload-drop__text">
                <h3>Drop your menu PDF here</h3>
                <p>or click to browse — multipage PDFs supported.</p>
              </div>
              <div className="ss-upload-drop__hint">
                <span className="ss-upload-drop__hint-dot" aria-hidden="true" />
                We extract dish names, prices, ingredients, and detect likely allergens.
              </div>
            </div>

            <div className="ss-upload-features">
              <h4>What we'll pick up</h4>
              <ul>
                <li>Item name, category, and price</li>
                <li>Ingredients (matched against our food database)</li>
                <li>Veg / non-veg / seafood markers</li>
                <li>Suspected allergens flagged for review</li>
              </ul>
            </div>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div
            key="processing"
            className="ss-upload-processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="ss-upload-processing__visual">
              <motion.div
                className="ss-upload-processing__ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />
              <div className="ss-upload-processing__doc" aria-hidden="true">
                <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
                  <path
                    d="M4 4h22l10 10v30H4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M26 4v10h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {[20, 26, 32].map((y, i) => (
                    <motion.path
                      key={i}
                      d={`M10 ${y}h20`}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.18,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                  ))}
                </svg>
              </div>
            </div>

            <h3>Reading {filename}…</h3>
            <p>Parsing the menu, matching ingredients, and flagging allergens.</p>

            <motion.ul
              className="ss-upload-processing__steps"
              variants={stagger(0.25, 0.2)}
              initial="hidden"
              animate="visible"
            >
              <motion.li variants={fadeUp}>Scanning pages…</motion.li>
              <motion.li variants={fadeUp}>Matching items to categories…</motion.li>
              <motion.li variants={fadeUp}>Detecting allergens and dish types…</motion.li>
            </motion.ul>
          </motion.div>
        )}

        {phase === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transitions.base}
          >
            <div className="ss-upload-review__header">
              <div>
                <Badge tone="success" subtle dot>
                  Extracted {extracted.length} items
                </Badge>
                <h3 style={{ marginTop: 'var(--sp-2)' }}>{filename}</h3>
                <p className="ss-upload-review__lede">
                  Tick the items you want to add. You can edit them after import.
                </p>
              </div>
              <Button
                variant="link"
                onClick={() =>
                  setSelected((s) =>
                    s.size === extracted.length ? new Set() : new Set(extracted.map((i) => i.id)),
                  )
                }
              >
                {selected.size === extracted.length ? 'Deselect all' : 'Select all'}
              </Button>
            </div>

            <motion.ul
              className="ss-upload-review__list"
              variants={stagger(0.05)}
              initial="hidden"
              animate="visible"
            >
              {extracted.map((item) => {
                const checked = selected.has(item.id);
                return (
                  <motion.li
                    key={item.id}
                    variants={fadeUp}
                    className={cn('ss-upload-review__item', checked && 'ss-upload-review__item--on')}
                  >
                    <Checkbox checked={checked} onChange={() => toggleSelect(item.id)} />
                    <div className="ss-upload-review__body">
                      <div className="ss-upload-review__title-row">
                        <DishMark type={item.dishType} />
                        <strong>{item.name}</strong>
                        <span className="ss-upload-review__price">
                          {currency} {item.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="ss-upload-review__meta">
                        <span>{lookupCategory(item.categoryId)}</span>
                        <span>·</span>
                        <span>{dishTypeLabels[item.dishType]}</span>
                        {item.allergens.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="ss-upload-review__allergens">
                              {item.allergens.length} allergen
                              {item.allergens.length === 1 ? '' : 's'} detected
                            </span>
                          </>
                        )}
                      </div>
                      <p className="ss-upload-review__desc">{item.description}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Drawer>
  );
};
