import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import './Checkbox.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: CheckboxProps) => {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'ss-check',
        checked && 'ss-check--on',
        disabled && 'ss-check--disabled',
      )}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="ss-check__input"
      />
      <span className="ss-check__box" aria-hidden="true">
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          initial={false}
          animate={{
            scale: checked ? 1 : 0.4,
            opacity: checked ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        >
          <path
            d="M3 7.5l2.5 2.5L11 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </span>
      {(label || description) && (
        <span className="ss-check__text">
          {label && <span className="ss-check__label">{label}</span>}
          {description && <span className="ss-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
};
