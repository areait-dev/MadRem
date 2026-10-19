import { useEffect } from 'react';

export const APP_NAME = 'promoremind';
export const APP_TAGLINE = 'Nessuna scadenza ti sfugge';

/** Imposta il titolo della scheda: "<pagina> · promoremind". Senza argomento usa lo slogan. */
export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${APP_NAME}` : `${APP_NAME} — ${APP_TAGLINE}`;
  }, [page]);
}
