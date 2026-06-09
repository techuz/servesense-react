import { useId } from 'react';
import { cn } from '@/lib/cn';
import './PhoneField.css';

/* US market (SOW §1.3) defaults to +1; a few extras cover the Spanish-speaking
   reach the SOW mentions. Shared across signup, staff, and restaurant so the
   phone field looks and behaves identically everywhere. */
export const DIAL_CODES = [
  { code: '+1', label: 'US +1' },
  { code: '+52', label: 'MX +52' },
  { code: '+34', label: 'ES +34' },
  { code: '+44', label: 'UK +44' },
] as const;

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
  autoComplete?: string;
}

/** Split a stored "+1 (212) 555-0142" value into its dial code + number. */
function splitPhone(value: string): { code: string; number: string } {
  const v = (value ?? '').trim();
  for (const { code } of DIAL_CODES) {
    if (v.startsWith(code)) return { code, number: v.slice(code.length).trim() };
  }
  return { code: '+1', number: v };
}

export const PhoneField = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder = '(212) 555-0142',
  id,
  autoComplete = 'tel-national',
}: PhoneFieldProps) => {
  const autoId = useId();
  const inputId = id ?? `phone-${autoId}`;
  const { code, number } = splitPhone(value);

  // Keep the dial code visible; emit empty when the number is cleared so
  // "required" validation in the parent still fires.
  const emit = (nextCode: string, nextNumber: string) =>
    onChange(nextNumber.trim() ? `${nextCode} ${nextNumber}` : '');

  return (
    <div className={cn('ss-field', error && 'ss-field--error')}>
      {label && (
        <label htmlFor={inputId} className="ss-field__label">
          {label}
          {required && <span aria-hidden="true" className="ss-field__required">*</span>}
        </label>
      )}
      <div className="ss-field__control ss-phone">
        <select
          className="ss-phone__code"
          value={code}
          onChange={(e) => emit(e.target.value, number)}
          aria-label="Country dial code"
        >
          {DIAL_CODES.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
        <input
          id={inputId}
          className="ss-field__input"
          type="tel"
          autoComplete={autoComplete}
          value={number}
          onChange={(e) => emit(code, e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
        />
      </div>
      {error ? (
        <p className="ss-field__error">{error}</p>
      ) : hint ? (
        <p className="ss-field__hint">{hint}</p>
      ) : null}
    </div>
  );
};
