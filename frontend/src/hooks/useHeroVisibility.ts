import { useEffect, useState } from 'react';

export function useHeroVisibility() {
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHeroVisible(entry.isIntersecting);
          document.body.classList.toggle('hero-not-visible', !entry.isIntersecting);
        });
      },
      { threshold: 0.05, rootMargin: '-5% 0px -5% 0px' }
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return isHeroVisible;
}
