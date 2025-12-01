import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AnimatedBackground } from './AnimatedBackground';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background */}
      <AnimatedBackground variant="default" />

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} readmd.dev — Share markdown beautifully
          </p>
        </div>
      </footer>
    </div>
  );
}
