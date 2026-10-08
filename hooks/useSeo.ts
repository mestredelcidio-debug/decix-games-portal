import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  schema?: Record<string, unknown>;
}

export function useSeo({ title, description, image, url, schema }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes('DECIX GAMES') ? title : `${title} | DECIX GAMES`;
    document.title = fullTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    // OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // OpenGraph Image
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', image);
    }

    // Canonical URL
    const canonicalUrl = url || window.location.href;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Schema.org JSON-LD injection
    if (schema) {
      let script = document.getElementById('decix-schema-json') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'decix-schema-json';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    }
  }, [title, description, image, url, schema]);
}
