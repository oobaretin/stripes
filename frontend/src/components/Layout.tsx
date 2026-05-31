import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useRouteSeo } from '../hooks/useRouteSeo';
import { Menu, X } from 'lucide-react';
import { APP_SHELL_ROUTES, appShellHref } from '../config/appShellRoutes';
import LocalDataBanner from './LocalDataBanner';

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useRouteSeo(location.pathname);

  const current = APP_SHELL_ROUTES.find((item) => location.pathname === appShellHref(item.path));
  const pageTitle = current?.navLabel ?? 'Striply';
  const pageDescription = current?.description ?? 'Diabetic test strip business dashboard';

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {APP_SHELL_ROUTES.map((item) => {
        const Icon = item.icon;
        const href = appShellHref(item.path);
        const isActive = location.pathname === href;
        return (
          <Link
            key={item.path}
            to={href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-800 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}
            />
            {item.navLabel}
          </Link>
        );
      })}
    </>
  );

  const ShellFooter = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="p-3 border-t border-slate-200 space-y-2">
      <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} Striply</p>
      <p className="text-center">
        <Link
          to="/sell"
          onClick={onNavigate}
          className="text-xs font-medium text-primary-700 hover:text-primary-900 hover:underline"
        >
          Sell supplies
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden lg:flex lg:w-56 xl:w-60 flex-col bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="Striply" className="h-9 w-auto max-w-[140px] object-contain object-left" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Main navigation">
          <NavLinks />
        </nav>
        <ShellFooter />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <p className="font-semibold text-slate-900 truncate text-base flex-1 min-w-0">{pageTitle}</p>
        </header>

        <LocalDataBanner />

        <header className="hidden lg:block border-b border-slate-200 bg-white px-8 py-5">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:px-8 lg:pb-10 outline-none"
        >
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="sr-only">{pageTitle}</h1>
            <Outlet />
          </div>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(18rem,88vw)] flex flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img src="/logo.png" alt="Striply" className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Main navigation">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
            <ShellFooter onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
