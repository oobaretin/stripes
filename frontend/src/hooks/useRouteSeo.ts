import { useEffect } from 'react';
import { applyRouteSeo } from '../lib/pageSeo';

/** Sync document title and meta tags with the authenticated app shell route. */
export function useRouteSeo(pathname: string) {
  useEffect(() => {
    applyRouteSeo(pathname);
  }, [pathname]);
}
