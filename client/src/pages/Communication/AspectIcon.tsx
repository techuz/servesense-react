import type { CommAspectKey } from '@/lib/mock/communication';

export const AspectIcon = ({ aspect }: { aspect: CommAspectKey }) => {
  switch (aspect) {
    case 'tone':
      return (
        // Sound wave — modulated, calm bars
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'language':
      return (
        // Speech bubble with a dot indicating words
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4H6a2 2 0 01-2-2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="10" r="1" fill="currentColor" />
          <circle cx="13" cy="10" r="1" fill="currentColor" />
        </svg>
      );
    case 'listening':
      return (
        // Ear with sound-wave arcs
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 21c-2 0-3-2-3-4 0-4 3-5 3-9a4 4 0 118 0c0 4-3 3-3 6 0 3-2 3-5 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 5.5c1.5.5 2.5 2 2.5 3.5M19 4c2 1 3 3 3 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};
