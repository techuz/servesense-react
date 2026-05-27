import { useCallback, useRef, useState, DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { OrientationSource, OrientationModuleMeta } from './types';
import './OrientationUpload.css';

interface Props {
  module: OrientationModuleMeta;
  /**
   * Called once the simulated parse completes. The parent stores the new
   * source metadata in its mock hook.
   */
  onComplete: (source: OrientationSource) => void;
  /** Variant: 'empty' shows full hero + featurettes; 'replace' is compact. */
  variant?: 'empty' | 'replace';
}

type Phase = 'drop' | 'processing';

/* Plausible page counts per module — generated from filename so subsequent
   parses of the same name are deterministic during demos. */
function pageCountFor(filename: string): number {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) hash = (hash * 31 + filename.charCodeAt(i)) | 0;
  return 4 + (Math.abs(hash) % 14);
}

export const OrientationUpload = ({ module, onComplete, variant = 'empty' }: Props) => {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>('drop');
  const [filename, setFilename] = useState<string>('');

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        notify({
          tone: 'error',
          title: 'PDF required',
          description: `Upload your ${module.label.toLowerCase()} as a PDF — we extract the structured content from it.`,
        });
        return;
      }
      setFilename(file.name);
      setPhase('processing');

      await new Promise((r) => setTimeout(r, 1600));

      const source: OrientationSource = {
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        pageCount: pageCountFor(file.name),
      };
      onComplete(source);
    },
    [module.label, notify, onComplete],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className={cn('ss-orient-upload', `ss-orient-upload--${variant}`)}>
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
              className={cn('ss-orient-upload__drop', dragOver && 'ss-orient-upload__drop--over')}
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
                className="ss-orient-upload__icon"
                animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div className="ss-orient-upload__copy">
                <h3>Upload your {module.label} document</h3>
                <p>or click to browse — multipage PDFs supported.</p>
              </div>
              <div className="ss-orient-upload__hint">
                <span className="ss-orient-upload__hint-dot" aria-hidden="true" />
                {module.hint}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div
            key="processing"
            className="ss-orient-upload__processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="ss-orient-upload__processing-visual">
              <motion.div
                className="ss-orient-upload__ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />
              <div className="ss-orient-upload__doc" aria-hidden="true">
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
            <p>Parsing the document and extracting structured sections.</p>
            <motion.ul
              className="ss-orient-upload__steps"
              variants={stagger(0.25, 0.2)}
              initial="hidden"
              animate="visible"
            >
              <motion.li variants={fadeUp}>Scanning pages…</motion.li>
              <motion.li variants={fadeUp}>Detecting sections…</motion.li>
              <motion.li variants={fadeUp}>Structuring content for the AI…</motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
