import { DragEvent, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { simulateSopExtraction, type SopStage } from '@/lib/mock/sop';

interface SopUploadProps {
  /** Called when extraction finishes with the parsed stages. */
  onExtracted: (fileName: string, stages: SopStage[], pageCount: number) => void;
  compact?: boolean;
}

type Phase = 'drop' | 'processing';

const ACCEPTED = ['.pdf', '.docx', '.txt'];

export const SopUpload = ({ onExtracted, compact = false }: SopUploadProps) => {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('drop');
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState('');

  const handleFile = async (file: File) => {
    const ok = ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!ok) {
      notify({ tone: 'error', title: 'Unsupported file', description: 'Upload a PDF, DOCX, or TXT service document.' });
      return;
    }
    setFilename(file.name);
    setPhase('processing');
    const stages = await simulateSopExtraction(file.name);
    const pageCount = Math.max(3, Math.min(12, Math.round(stages.length * 0.7)));
    onExtracted(file.name, stages, pageCount);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className={cn('ss-sop-upload', compact && 'ss-sop-upload--compact')}>
      <AnimatePresence mode="wait">
        {phase === 'drop' && (
          <motion.div key="drop" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={transitions.base}>
            <div
              className={cn('ss-sop-upload__drop', dragOver && 'ss-sop-upload__drop--over')}
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
                accept=".pdf,.docx,.txt"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <motion.div
                className="ss-sop-upload__icon"
                animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <div className="ss-sop-upload__copy">
                <h3>Drop your service SOP document</h3>
                <p>or click to browse — we extract each stage of service and the rules within it.</p>
              </div>
              <div className="ss-sop-upload__formats">PDF · DOCX · TXT · max 10 MB</div>
            </div>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div key="processing" className="ss-sop-upload__processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="ss-sop-upload__visual">
              <motion.div className="ss-sop-upload__ring" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
              <div className="ss-sop-upload__doc" aria-hidden="true">
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
            <p>Extracting stages and the rules within each.</p>
            <motion.ul className="ss-sop-upload__steps" variants={stagger(0.25, 0.2)} initial="hidden" animate="visible">
              <motion.li variants={fadeUp}>Scanning the document…</motion.li>
              <motion.li variants={fadeUp}>Detecting stages of service…</motion.li>
              <motion.li variants={fadeUp}>Structuring rules for review…</motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
