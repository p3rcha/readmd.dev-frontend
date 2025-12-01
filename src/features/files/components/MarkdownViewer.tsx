import { useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { MermaidDiagram } from './MermaidDiagram';
import 'katex/dist/katex.min.css';

// Custom theme matching the app's glassmorphic violet style
const customCodeTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#e4e4e7', // zinc-200
    background: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace",
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: '#e4e4e7',
    background: '#0f0f14', // Deep neutral dark
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace",
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.6',
    tabSize: 2,
    padding: '1.25rem',
    paddingLeft: '1.5rem',
    margin: '0',
    overflow: 'auto',
    borderRadius: '0.5rem',
    border: 'none',
    borderLeft: '3px solid #8b5cf6', // Violet accent bar
  },
  comment: { color: '#6b7280' }, // gray-500
  prolog: { color: '#6b7280' },
  doctype: { color: '#6b7280' },
  cdata: { color: '#6b7280' },
  punctuation: { color: '#a1a1aa' }, // zinc-400
  property: { color: '#c4b5fd' }, // violet-300
  tag: { color: '#f472b6' }, // pink-400
  boolean: { color: '#c4b5fd' }, // violet-300
  number: { color: '#c4b5fd' }, // violet-300
  constant: { color: '#c4b5fd' }, // violet-300
  symbol: { color: '#c4b5fd' },
  deleted: { color: '#f87171' }, // red-400
  selector: { color: '#a5f3fc' }, // cyan-200
  'attr-name': { color: '#a5f3fc' },
  string: { color: '#fcd34d' }, // amber-300
  char: { color: '#fcd34d' },
  builtin: { color: '#f0abfc' }, // fuchsia-300
  inserted: { color: '#86efac' }, // green-300
  operator: { color: '#f472b6' }, // pink-400
  entity: { color: '#fcd34d', cursor: 'help' },
  url: { color: '#a5f3fc' },
  '.language-css .token.string': { color: '#fcd34d' },
  '.style .token.string': { color: '#fcd34d' },
  atrule: { color: '#818cf8' }, // indigo-400
  'attr-value': { color: '#fcd34d' }, // amber-300
  keyword: { color: '#818cf8' }, // indigo-400
  function: { color: '#67e8f9' }, // cyan-300
  'class-name': { color: '#f0abfc' }, // fuchsia-300
  regex: { color: '#fcd34d' },
  important: { color: '#f472b6', fontWeight: 'bold' },
  variable: { color: '#e4e4e7' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface MarkdownViewerProps {
  content: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

// Generate slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Normalize text for consistent matching (normalize whitespace)
function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// Generate unique IDs for headings
function generateHeadingIds(content: string): Map<string, string> {
  const idMap = new Map<string, string>();
  const idCounts = new Map<string, number>();
  const seenIds = new Set<string>(); // Track all generated IDs to ensure uniqueness
  
  // Extract headings using regex
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = normalizeText(match[2]); // Normalize whitespace
    const baseId = slugify(text);
    
    // Generate unique ID
    let uniqueId = baseId;
    let count = 0;
    
    // If base ID already exists, append a number
    while (seenIds.has(uniqueId)) {
      count++;
      uniqueId = `${baseId}-${count}`;
    }
    
    seenIds.add(uniqueId);
    idCounts.set(baseId, count);
    
    // Store both the exact text match and the slugified version
    idMap.set(`${level}-${text}`, uniqueId);
    idMap.set(`${level}-${baseId}`, uniqueId); // Also store slugified version for fallback
  }
  
  return idMap;
}

// Extract text content from React children recursively
function extractTextFromChildren(children: any): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children && typeof children === 'object') {
    if (children.props && children.props.children) {
      return extractTextFromChildren(children.props.children);
    }
    if (children.props && children.props.value) {
      return String(children.props.value);
    }
    if (children.props && typeof children.props.children === 'string') {
      return children.props.children;
    }
  }
  return '';
}

export function MarkdownViewer({ content, scrollContainerRef }: MarkdownViewerProps) {
  const headingIdMap = useMemo(() => generateHeadingIds(content), [content]);
  const headingRefs = useRef<Map<string, HTMLHeadingElement>>(new Map());

  // Sync refs after render to catch any headings that might have been missed
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      const markdownContainer = document.querySelector('.markdown-content');
      if (markdownContainer) {
        const allHeadings = markdownContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
        allHeadings.forEach((heading) => {
          if (heading.id) {
            headingRefs.current.set(heading.id, heading as HTMLHeadingElement);
            // Also store by lowercase ID for case-insensitive matching
            headingRefs.current.set(heading.id.toLowerCase(), heading as HTMLHeadingElement);
          }
        });
      }
    }, 100); // Small delay to ensure React has finished rendering
    
    return () => clearTimeout(timeoutId);
  }, [content]);

  // Handle anchor link clicks (internal navigation)
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.slice(1); // Remove # from href
      const clickedLink = e.currentTarget;
      
      // Small delay to ensure DOM is fully updated
      setTimeout(() => {
        const markdownContainer = document.querySelector('.markdown-content');
        if (!markdownContainer) return;
        
        const container = scrollContainerRef?.current || markdownContainer.parentElement;
        
        // Get all headings that match the target ID
        const allHeadings = markdownContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const matchingHeadings: HTMLElement[] = [];
        
        // Find all headings that match the target ID (exact, case-insensitive, or slugified)
        for (const heading of Array.from(allHeadings)) {
          if (heading.id) {
            const headingId = heading.id.toLowerCase();
            const targetIdLower = targetId.toLowerCase();
            
            // Check exact match, case-insensitive match, or slugified match
            if (
              heading.id === targetId ||
              headingId === targetIdLower ||
              slugify(heading.textContent || '') === targetId ||
              slugify(heading.textContent || '') === targetIdLower
            ) {
              matchingHeadings.push(heading as HTMLElement);
            }
          }
        }
        
        if (matchingHeadings.length === 0) return;
        
        // Get the position of the clicked link relative to the container
        let linkPosition: number;
        if (container) {
          const linkRect = clickedLink.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          linkPosition = linkRect.top - containerRect.top + container.scrollTop;
        } else {
          linkPosition = clickedLink.getBoundingClientRect().top + window.scrollY;
        }
        
        // Find the heading that appears closest BELOW the clicked link
        let targetElement: HTMLElement | null = null;
        let minDistance = Infinity;
        
        for (const heading of matchingHeadings) {
          let headingPosition: number;
          if (container) {
            const headingRect = heading.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            headingPosition = headingRect.top - containerRect.top + container.scrollTop;
          } else {
            headingPosition = heading.getBoundingClientRect().top + window.scrollY;
          }
          
          const distance = headingPosition - linkPosition;
          
          // Only consider headings that are below the link (positive distance)
          // and find the closest one
          if (distance > 0 && distance < minDistance) {
            minDistance = distance;
            targetElement = heading;
          }
        }
        
        // If no heading found below, fallback to the first matching heading
        if (!targetElement && matchingHeadings.length > 0) {
          targetElement = matchingHeadings[0];
        }
        
        if (targetElement) {
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = targetElement.getBoundingClientRect();
            const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 20; // 20px offset
            
            container.scrollTo({
              top: scrollTop,
              behavior: 'smooth',
            });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 50); // Slightly longer delay to ensure refs are synced
    }
  };

  // Create heading renderer
  const createHeadingRenderer = (level: number) => {
    return ({ children, ...props }: any) => {
      const text = normalizeText(extractTextFromChildren(children));
      const slugifiedText = slugify(text);
      const key = `${level}-${text}`;
      let id = headingIdMap.get(key);
      
      // If not found by exact text, try slugified version
      if (!id) {
        id = headingIdMap.get(`${level}-${slugifiedText}`);
      }
      
      // If still not found, try to find by matching slugified text
      if (!id) {
        // Search through the map for matching slugified IDs
        for (const [mapKey, mapId] of headingIdMap.entries()) {
          const mapText = mapKey.split('-').slice(1).join('-'); // Get text part after level
          if (slugify(mapText) === slugifiedText) {
            id = mapId;
            break;
          }
        }
      }
      
      // Final fallback: use slugified text directly (this ensures we always have an ID)
      if (!id) {
        id = slugifiedText;
      }
      
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      
      const handleClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
        const element = e.currentTarget;
        const container = scrollContainerRef?.current || document.querySelector('.markdown-content')?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 20;
          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      };
      
      return (
        <HeadingTag
          {...props}
          id={id}
          ref={(el: HTMLHeadingElement | null) => {
            if (el) {
              // Store both exact ID and lowercase version for matching
              headingRefs.current.set(id, el);
              headingRefs.current.set(id.toLowerCase(), el);
              // Also store by slugified text for additional matching
              headingRefs.current.set(slugifiedText, el);
            }
          }}
          className="markdown-heading cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          onClick={handleClick}
        >
          {children}
        </HeadingTag>
      );
    };
  };

  const components: Components = {
    h1: createHeadingRenderer(1),
    h2: createHeadingRenderer(2),
    h3: createHeadingRenderer(3),
    h4: createHeadingRenderer(4),
    h5: createHeadingRenderer(5),
    h6: createHeadingRenderer(6),
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('#')) {
        // Internal anchor links - scroll within page
        return (
          <a
            {...props}
            href={href}
            onClick={(e) => handleAnchorClick(e, href)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {children}
          </a>
        );
      }
      // External links - open in new tab
      return (
        <a
          {...props}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {children}
        </a>
      );
    },
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');
      
      // Check if this is an inline code or a code block
      const isInline = !className && !codeString.includes('\n');
      
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      
      // Handle Mermaid diagrams
      if (language === 'mermaid') {
        return <MermaidDiagram chart={codeString} />;
      }
      
      return (
        <SyntaxHighlighter
          style={customCodeTheme}
          language={language || 'text'}
          PreTag="div"
          customStyle={{
            margin: 0,
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      );
    },
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]} 
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

