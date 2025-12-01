import { useEffect, useState } from 'react';
import type { Heading } from './MarkdownViewer';

interface TableOfContentsProps {
  headings: Heading[];
  activeId?: string;
  onHeadingClick: (id: string) => void;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export function TableOfContents({ headings, activeId, onHeadingClick, scrollContainerRef }: TableOfContentsProps) {
  const [currentActiveId, setCurrentActiveId] = useState<string | undefined>(activeId);

  // Update active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      
      // Find the heading that's currently in view
      let activeHeadingId: string | undefined;
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const element = document.getElementById(heading.id);
        
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top + scrollTop;
          
          if (relativeTop <= scrollTop + 100) { // 100px offset from top
            activeHeadingId = heading.id;
            break;
          }
        }
      }
      
      if (activeHeadingId !== currentActiveId) {
        setCurrentActiveId(activeHeadingId);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [headings, currentActiveId, scrollContainerRef]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    setCurrentActiveId(id);
    onHeadingClick(id);
  };

  return (
    <div className="toc-container">
      <div className="toc-header">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Table of Contents</h3>
      </div>
      <nav className="toc-nav" aria-label="Table of contents">
        <ul className="toc-list space-y-1">
          {headings.map((heading, index) => (
            <li
              key={`${heading.level}-${heading.id}-${index}`}
              className={`toc-item toc-level-${heading.level} ${
                currentActiveId === heading.id ? 'toc-active' : ''
              }`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(heading.id);
                }}
                className={`toc-link block px-2 py-1 rounded text-sm transition-colors ${
                  currentActiveId === heading.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

