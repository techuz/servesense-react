import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className, rows = 4, ...rest }, ref) => {
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
        <div className="ss-field__control ss-field__control--multiline">
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="ss-field__input ss-field__input--textarea"
            {...rest}
          />
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

Textarea.displayName = 'Textarea';
