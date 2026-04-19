'use client';

/**
 * EmailFrame — renders the recap HTML inside an isolated <iframe srcdoc>.
 *
 * Why iframe:
 *   - The email HTML is a full document (<html><head><body>). Rendering it via
 *     dangerouslySetInnerHTML inside a div silently strips the html/head/body
 *     tags and the styles on them, which makes the preview look nothing like
 *     what recipients will see.
 *   - Iframe sandboxes the document, preserves all tags, and can't escape back
 *     into the admin UI styles.
 *
 * Auto-sizing: on load, read the iframe body's scrollHeight and size the
 * iframe to match so the parent page doesn't show a nested scrollbar.
 */

import { useRef, useState } from 'react';

interface Props {
  html: string;
  minHeight?: number;
}

export default function EmailFrame({ html, minHeight = 600 }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  function handleLoad() {
    const iframe = ref.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;
      const h = Math.max(minHeight, doc.documentElement.scrollHeight, doc.body.scrollHeight);
      setHeight(h + 16); // tiny buffer to avoid a 1px scrollbar
    } catch {
      // cross-origin blocked (shouldn't happen with srcdoc) — keep default
    }
  }

  return (
    <iframe
      ref={ref}
      title="Sponsor recap preview"
      srcDoc={html}
      onLoad={handleLoad}
      style={{
        width: '100%',
        height,
        border: 'none',
        background: '#060606',
        display: 'block',
      }}
      sandbox="allow-same-origin"
    />
  );
}
