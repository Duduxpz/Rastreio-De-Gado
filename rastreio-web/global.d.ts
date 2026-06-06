import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: React.Key;
    }

    interface IntrinsicElements {
      div: React.HTMLAttributes<HTMLDivElement>;
      h1: React.HTMLAttributes<HTMLHeadingElement>;
      p: React.HTMLAttributes<HTMLParagraphElement>;
      [elemName: string]: any;
    }
  }
}

export {};
