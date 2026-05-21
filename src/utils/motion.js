export const MOBILE_BREAKPOINT = 768;

export const isMobileViewport = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const shouldUseFastMotion = () =>
  isMobileViewport() || prefersReducedMotion();

export const pageEnter = () => {
  const fast = shouldUseFastMotion();
  return {
    initial: { opacity: 0, y: fast ? 6 : 15 },
    animate: { opacity: 1, y: 0 },
    transition: fast
      ? { duration: 0.15, ease: 'easeOut' }
      : { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  };
};

export const overlayFade = () => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: shouldUseFastMotion() ? 0.12 : 0.2 },
});

export const drawerSlide = (offset = 280) => {
  const fast = shouldUseFastMotion();
  return {
    initial: { x: offset },
    animate: { x: 0 },
    exit: { x: offset },
    transition: fast
      ? { type: 'tween', duration: 0.18, ease: 'easeOut' }
      : { type: 'spring', damping: 28, stiffness: 320 },
  };
};

export const modalPop = () => {
  const fast = shouldUseFastMotion();
  return {
    initial: { scale: fast ? 0.98 : 0.9, y: fast ? 4 : 15, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: { scale: fast ? 0.98 : 0.9, y: fast ? 4 : 10, opacity: 0 },
    transition: fast
      ? { duration: 0.18, ease: 'easeOut' }
      : { type: 'spring', damping: 28, stiffness: 320 },
  };
};

export const cardEnter = () => {
  const fast = shouldUseFastMotion();
  return {
    initial: { opacity: 0, scale: fast ? 1 : 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: fast ? 1 : 0.95 },
    transition: { duration: fast ? 0.12 : 0.25 },
  };
};

export const toastMotion = () => {
  const fast = shouldUseFastMotion();
  return {
    initial: { opacity: 0, y: -12, scale: fast ? 1 : 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: fast ? 1 : 0.95, transition: { duration: 0.12 } },
    transition: fast
      ? { duration: 0.15, ease: 'easeOut' }
      : { type: 'spring', damping: 28, stiffness: 320 },
  };
};

export const slideX = (direction = 1) => {
  const fast = shouldUseFastMotion();
  const offset = fast ? 8 : 20;
  return {
    initial: { opacity: 0, x: direction * offset },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -direction * offset },
    transition: { duration: fast ? 0.15 : 0.3 },
  };
};

export const kpiHoverProps = () =>
  shouldUseFastMotion() ? {} : { whileHover: { y: -3 } };

export const kpiLiftHover = (boxShadow) =>
  shouldUseFastMotion() ? {} : { whileHover: { y: -5, boxShadow } };
