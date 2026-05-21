import { useEffect } from 'react';

const syncPerfFlags = () => {
  const root = document.documentElement;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (mobile || reduced) {
    root.setAttribute('data-fast-motion', '');
  } else {
    root.removeAttribute('data-fast-motion');
  }
};

const MobilePerfInit = () => {
  useEffect(() => {
    syncPerfFlags();

    const mobileMq = window.matchMedia('(max-width: 768px)');
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onChange = () => syncPerfFlags();
    mobileMq.addEventListener('change', onChange);
    reducedMq.addEventListener('change', onChange);

    return () => {
      mobileMq.removeEventListener('change', onChange);
      reducedMq.removeEventListener('change', onChange);
      document.documentElement.removeAttribute('data-fast-motion');
    };
  }, []);

  return null;
};

export default MobilePerfInit;
