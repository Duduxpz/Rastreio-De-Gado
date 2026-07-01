import type { SVGProps } from 'react';

type AnimalType = 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave' | 'cachorro' | 'outro';

interface AnimalIconProps extends SVGProps<SVGSVGElement> {
  type: AnimalType;
  size?: number;
}

const iconClassName = 'stroke-current fill-none';

export function AnimalIcon({ type, size = 24, className, ...props }: AnimalIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className: `${iconClassName} ${className || ''}`.trim(),
    ...props,
  };

  switch (type) {
    case 'equino':
      return (
        <svg {...commonProps}>
          <path d="M5 8c0-2 1.5-3.5 3.5-3.5h2.5c1.2 0 2.2.8 2.5 2l.7 3.2c.2.8.8 1.4 1.5 1.6l2.2.7c.8.2 1.3 1.1 1.3 2 0 1.1-.9 2-2 2H8a2 2 0 0 1-2-2V8Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 18v-2.5M16 18v-2.5" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 8h4" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'ovino':
      return (
        <svg {...commonProps}>
          <path d="M8 8.5c0-1.4 1.1-2.5 2.5-2.5h3c1.4 0 2.5 1.1 2.5 2.5v2c0 1.3-.9 2.4-2.2 2.7l-1.4.4c-.8.2-1.3 1-1.3 1.8V16h-2v-1.6c0-.8-.5-1.6-1.3-1.8l-1.4-.4A2.6 2.6 0 0 1 8 10.5v-2Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 18v-2" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 18v-2" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'caprino':
      return (
        <svg {...commonProps}>
          <path d="M7 9c0-2.2 1.8-4 4-4h2a3 3 0 0 1 3 3v2.5c0 1.2-.5 2.3-1.4 3l-2.2 1.8c-.6.5-1.4.8-2.2.8H8a2 2 0 0 1-2-2V9Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 18v-2.5M16 18v-2.5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'suino':
      return (
        <svg {...commonProps}>
          <path d="M7 8.5A2.5 2.5 0 0 1 9.5 6h5A2.5 2.5 0 0 1 17 8.5V10a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V8.5Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 12h8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 16v-2M15 16v-2" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'ave':
      return (
        <svg {...commonProps}>
          <path d="M5 14c2.8-2.5 5.5-3.5 8.5-3.5 1.8 0 3.2.4 4.5 1.2-1.4 2.2-3.9 3.3-6.6 3.3-1.8 0-3.2-.3-4.6-.7L5 14Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 10.5c.6-1.4 1.3-2.5 2.4-3.5" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M13 10.5 15 8" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'cachorro':
      return (
        <svg {...commonProps}>
          <path d="M8 9.5c0-1.8 1.4-3.2 3.2-3.2h1.6c1.8 0 3.2 1.4 3.2 3.2v1.7c0 1-.4 1.9-1.1 2.6l-1.2 1.2a2 2 0 0 1-1.4.6H10a2 2 0 0 1-1.4-.6l-1.2-1.2A3.8 3.8 0 0 1 8 11.2v-1.7Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 17v-2.5M14 17v-2.5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M7 8a3 3 0 1 1 6 0v1.5h1.5A2.5 2.5 0 0 1 17 12v1.2c0 1.1-.9 2-2 2h-1.5V18a1 1 0 1 1-2 0v-2.8H10A2 2 0 0 1 8 13.2V12a2.5 2.5 0 0 1 2.5-2.5H10V8Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11.5h4" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}
