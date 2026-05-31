import { useEffect } from 'react';
import { applySellPageSeo } from '../lib/pageSeo';

/** SEO meta + JSON-LD for the public `/sell` landing page. */
export function useSellPageHead() {
  useEffect(() => {
    applySellPageSeo();

    const base =
      (import.meta.env.VITE_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''))?.replace(
        /\/$/,
        ''
      ) || '';

    const organization: Record<string, unknown> = {
      '@type': 'Organization',
      name: 'Striply',
      description:
        'Tools and public information for selling diabetic test strips and related supplies with clear quotes and verification.',
    };
    if (base) {
      organization['@id'] = `${base}/#organization`;
      organization.url = base;
      organization.logo = `${base}/logo.png`;
    }

    const webPage: Record<string, unknown> = {
      '@type': 'WebPage',
      name: 'Sell diabetic test strips — Striply',
      description:
        'Request a quote to sell extra diabetic supplies. Shipping, eligibility, and payment steps explained.',
      about: { '@type': 'Thing', name: 'Diabetic test strips' },
    };
    if (base) {
      webPage['@id'] = `${base}/sell#webpage`;
      webPage.url = `${base}/sell`;
      webPage.isPartOf = { '@id': `${base}/#website` };
    }

    const graph: Record<string, unknown>[] = [organization, webPage];

    if (base) {
      graph.push({
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: 'Striply',
        url: base,
        publisher: { '@id': `${base}/#organization` },
      });
    }

    const data = { '@context': 'https://schema.org', '@graph': graph };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-striply', 'sell-jsonld');
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const existing = document.head.querySelector('script[data-striply="sell-jsonld"]');
      if (existing?.parentNode) existing.parentNode.removeChild(existing);
    };
  }, []);
}
