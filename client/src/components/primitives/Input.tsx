import { InputHTMLAttributes, forwardRef, useId } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingIcon, trailingIcon, id, className = '', ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className={`ss-field ${error ? 'ss-field--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ss-field__label">
            {label}
            {rest.required && <span aria-hidden="true" className="ss-field__required">*</span>}
          </label>
        )}
        <div className="ss-field__control">
          {leadingIcon && <span className="ss-field__icon ss-field__icon--leading">{leadingIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="ss-field__input"
            {...rest}
          />
          {trailingIcon && <span className="ss-field__icon ss-field__icon--trailing">{trailingIcon}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="ss-field__error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="ss-field__hint">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
