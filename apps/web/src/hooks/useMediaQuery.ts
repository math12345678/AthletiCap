import { useState, useEffect } from 'react';

const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const useBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  const px = parseInt(breakpoints[breakpoint]);
  const query = `(min-width: ${px}px)`;
  return useMediaQuery(query);
};

export const useIsMobile = () => !useBreakpoint('md');
export const useIsTablet = () => useBreakpoint('md') && !useBreakpoint('lg');
export const useIsDesktop = () => useBreakpoint('lg');
