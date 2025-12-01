import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

// Initialize mermaid with theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#8b5cf6',
    primaryTextColor: '#e4e4e7',
    primaryBorderColor: '#6d28d9',
    lineColor: '#a1a1aa',
    secondaryColor: '#1e1e2e',
    tertiaryColor: '#0f0f14',
    background: '#0f0f14',
    mainBkg: '#1e1e2e',
    secondBkg: '#0f0f14',
    nodeBorder: '#8b5cf6',
    clusterBkg: '#1e1e2e',
    clusterBorder: '#6d28d9',
    titleColor: '#e4e4e7',
    edgeLabelBackground: '#1e1e2e',
    nodeTextColor: '#e4e4e7',
  },
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
});

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        <div className="font-semibold mb-2">Diagram Error</div>
        <pre className="text-sm whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm opacity-70">Show source</summary>
          <pre className="mt-2 text-xs opacity-60">{chart}</pre>
        </details>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="my-4 p-4 rounded-lg bg-[#0f0f14] border border-violet-500/20 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

