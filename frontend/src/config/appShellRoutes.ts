import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  UserRound,
  Store,
  Package,
  TrendingUp,
  TrendingDown,
  User,
} from 'lucide-react';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import Buyers from '../pages/Buyers';
import Products from '../pages/Products';
import Purchases from '../pages/Purchases';
import Sales from '../pages/Sales';
import Profile from '../pages/Profile';

export type AppShellRoute = {
  /** URL segment under the app shell (`/` parent), e.g. `dashboard` → `/dashboard` */
  path: string;
  navLabel: string;
  icon: LucideIcon;
  Component: ComponentType;
};

export const APP_SHELL_ROUTES: AppShellRoute[] = [
  { path: 'dashboard', navLabel: 'Dashboard', icon: LayoutDashboard, Component: Dashboard },
  { path: 'customers', navLabel: 'Sellers', icon: UserRound, Component: Customers },
  { path: 'buyers', navLabel: 'Buyers', icon: Store, Component: Buyers },
  { path: 'products', navLabel: 'Products', icon: Package, Component: Products },
  { path: 'purchases', navLabel: 'Purchases', icon: TrendingDown, Component: Purchases },
  { path: 'sales', navLabel: 'Sales', icon: TrendingUp, Component: Sales },
  { path: 'profile', navLabel: 'Profile', icon: User, Component: Profile },
];

export function appShellHref(segment: string) {
  return `/${segment}`;
}

export const APP_SHELL_DEFAULT_HREF = appShellHref('dashboard');
