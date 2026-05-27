import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import './Switch.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
}

export const Switch = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  size = 'md',
  id,
}: SwitchProps) => {
  const autoId = useId();
  const switchId = id ?? autoId;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'ss-switch',
        `ss-switch--${size}`,
        checked && 'ss-switch--on',
        disabled && 'ss-switch--disabled',
      )}
    >
      <input
        id={switchId}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="ss-switch__input"
      />
      <span className="ss-switch__track" aria-hidden="true">
        <motion.span
          className="ss-switch__thumb"
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 38 }}
        />
      </span>
      {(label || description) && (
        <span className="ss-switch__text">
          {label && <span className="ss-switch__label">{label}</span>}
          {description && <span className="ss-switch__desc">{description}</span>}
        </span>
      )}
    </label>
  );
};
