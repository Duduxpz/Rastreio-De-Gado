import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const result = useMemo(() => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    return { isMobile, isTablet, isDesktop, width, height } as const;
  }, [width, height]);

  return result;
}

export default useResponsive;
