import type { ExcellenceAreaKey } from '@/lib/mock/excellence';

export const AreaIcon = ({ area }: { area: ExcellenceAreaKey }) => {
  switch (area) {
    case 'anticipation':
      return (
        // Radar / sensing — concentric arcs with a dot
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path
            d="M7.5 12a4.5 4.5 0 019 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M4 12a8 8 0 0116 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      );
    case 'peak_hours':
      return (
        // Lightning — speed
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14 3L5 13h6l-1 8 9-11h-6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.18"
          />
        </svg>
      );
    case 'vips':
      return (
        // Four-pointed sparkle star
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M19 17l.6 2L21.5 19.6 19.5 20.3 19 22l-.6-1.7L17 19.6 18.5 19z"
            fill="currentColor"
          />
        </svg>
      );
    case 'recovery':
      return (
        // Shield with a soft heart — care
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M9 11.5c0-1 .8-1.8 1.8-1.8.6 0 1.1.3 1.2.7.1-.4.6-.7 1.2-.7 1 0 1.8.8 1.8 1.8 0 1.6-3 3.5-3 3.5s-3-1.9-3-3.5z"
            fill="currentColor"
          />
        </svg>
      );
  }
};
