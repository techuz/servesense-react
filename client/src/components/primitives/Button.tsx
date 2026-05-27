import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth,
      loading,
      leadingIcon,
      trailingIcon,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const classes = cn(
      'ss-btn',
      `ss-btn--${variant}`,
      `ss-btn--${size}`,
      fullWidth && 'ss-btn--full',
      loading && 'ss-btn--loading',
      className,
    );

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileHover={disabled || loading ? undefined : { y: -1 }}
        whileTap={disabled || loading ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        {...rest}
      >
        {leadingIcon && <span className="ss-btn__icon">{leadingIcon}</span>}
        <span className="ss-btn__label">{children}</span>
        {trailingIcon && <span className="ss-btn__icon">{trailingIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
