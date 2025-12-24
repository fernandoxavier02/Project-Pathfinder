import { ReactNode } from 'react';
import { ClockWidget } from './ClockWidget';

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Layout compartilhado para páginas que inclui o relógio no topo
 */
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ClockWidget />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
