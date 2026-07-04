import { useEffect, useState } from "react";

// Seuils par défaut — ajustables si besoin (tablette portrait ≈ 768px).
const DEFAULT_BREAKPOINT = 768;

/**
 * Retourne `true` si la largeur d'écran est inférieure au breakpoint.
 * Réagit en direct au redimensionnement (desktop) et au changement
 * d'orientation (mobile), contrairement à une simple lecture unique
 * de window.innerWidth au montage.
 *
 * Usage :
 *   const isMobile = useMediaQuery();               // 768px par défaut
 *   const isSmall  = useMediaQuery(480);             // breakpoint custom
 */
export function useMediaQuery(breakpoint = DEFAULT_BREAKPOINT) {
  const getMatch = () =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = e => setMatches(e.matches);
    // addEventListener disponible sur tous les navigateurs modernes ;
    // fallback addListener pour compatibilité ancienne (Safari < 14) omis
    // volontairement — pas de contrainte de support ancien signalée.
    mql.addEventListener("change", handler);
    setMatches(mql.matches); // re-sync si le breakpoint a changé entre renders
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return matches;
}
