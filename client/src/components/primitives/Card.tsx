import { HTMLAttributes, forwardRef } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 'low', padding = 'md', interactive, className = '', children, ...rest }, ref) => {
    const classes = [
      'ss-card',
      `ss-card--elev-${elevation}`,
      `ss-card--p-${padding}`,
      interactive ? 'ss-card--interactive' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '' }: HTMLAttributes<HTMLDivElement>) => (
  <header className={`ss-card__header ${className}`}>{children}</header>
);

export const CardTitle = ({ children, className = '' }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`ss-card__title ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`ss-card__description ${className}`}>{children}</p>
);

export const CardBody = ({ children, className = '' }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`ss-card__body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: HTMLAttributes<HTMLDivElement>) => (
  <footer className={`ss-card__footer ${className}`}>{children}</footer>
);
