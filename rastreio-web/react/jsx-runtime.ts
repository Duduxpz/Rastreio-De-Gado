export function jsx(type: any, props: any, key: any): any {
  return { type, props, key };
}

export function jsxs(type: any, props: any, key: any): any {
  return { type, props, key };
}

export const Fragment = Symbol.for('react.fragment');
