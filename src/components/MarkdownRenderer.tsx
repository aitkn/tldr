import { useRef, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaidInitialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
  });
}

// Custom renderer: turn ```mermaid blocks into <pre class="mermaid"> for mermaid.run()
const renderer = new marked.Renderer();
const origCode = renderer.code.bind(renderer);
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  if (lang === 'mermaid') {
    return `<pre class="mermaid">${text}</pre>`;
  }
  return origCode({ text, lang });
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = marked.parse(content, { async: false }) as string;

  useEffect(() => {
    if (!ref.current) return;
    const mermaidEls = ref.current.querySelectorAll('pre.mermaid');
    if (mermaidEls.length === 0) return;

    initMermaid();
    // Re-sync theme before each render
    mermaid.initialize({
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
    });
    mermaid.run({ nodes: mermaidEls as NodeListOf<HTMLElement> }).catch(() => {
      // If mermaid fails to parse, leave the raw text visible
    });
  }, [html]);

  return <div ref={ref} class="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
