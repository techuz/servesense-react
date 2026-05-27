import { HTMLAttributes } from 'react';
import './Badge.css';

export type BadgeTone = 'neutral' | 'brand' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  subtle?: boolean;
  dot?: boolean;
}

export const Badge = ({
  tone = 'neutral',
  subtle = true,
  dot,
  className = '',
  children,
  ...rest
}: BadgeProps) => {
  const classes = [
    'ss-badge',
    `ss-badge--${tone}`,
    subtle ? 'ss-badge--subtle' : 'ss-badge--solid',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className="ss-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};
