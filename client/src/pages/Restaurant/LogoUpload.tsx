import { useCallback, useRef, useState, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface LogoUploadProps {
  logoUrl: string | null;
  brandInitial: string;
  onChange: (dataUrl: string | null) => void;
  editing: boolean;
}

export const LogoUpload = ({ logoUrl, brandInitial, onChange, editing }: LogoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') onChange(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (!editing) {
    return (
      <motion.div
        className="ss-logo"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Restaurant logo" className="ss-logo__img" />
        ) : (
          <span className="ss-logo__placeholder">{brandInitial}</span>
        )}
      </motion.div>
    );
  }

  return (
    <div
      className={cn('ss-logo-drop', dragOver && 'ss-logo-drop--over', logoUrl && 'ss-logo-drop--has-image')}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
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
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {logoUrl ? (
        <>
          <img src={logoUrl} alt="Current logo preview" className="ss-logo-drop__preview" />
          <button
            type="button"
            className="ss-logo-drop__remove"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            aria-label="Remove logo"
          >
            ×
          </button>
        </>
      ) : (
        <div className="ss-logo-drop__content">
          <motion.div
            className="ss-logo-drop__icon"
            animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.06 : 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <div className="ss-logo-drop__text">
            <strong>Upload logo</strong>
            <span>PNG or SVG · drag & drop or click</span>
          </div>
        </div>
      )}
    </div>
  );
};
