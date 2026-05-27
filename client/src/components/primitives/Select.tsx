import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className={cn('ss-field', error && 'ss-field--error', className)}>
        {label && (
          <label htmlFor={inputId} className="ss-field__label">
            {label}
            {rest.required && <span aria-hidden="true" className="ss-field__required">*</span>}
          </label>
        )}
        <div className="ss-field__control ss-field__control--select">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="ss-field__input ss-field__input--select"
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="ss-field__select-chev" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M2 4l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="ss-field__error">{error}</p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="ss-field__hint">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
