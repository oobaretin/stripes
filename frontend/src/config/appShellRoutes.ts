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
  description: string;
  icon: LucideIcon;
  Component: ComponentType;
};

export const APP_SHELL_ROUTES: AppShellRoute[] = [
  {
    path: 'dashboard',
    navLabel: 'Dashboard',
    description: 'Revenue, costs, and recent activity at a glance.',
    icon: LayoutDashboard,
    Component: Dashboard,
  },
  {
    path: 'customers',
    navLabel: 'Sellers',
    description: 'People you buy test strips from — online or in person.',
    icon: UserRound,
    Component: Customers,
  },
  {
    path: 'buyers',
    navLabel: 'Buyers',
    description: 'Resale partners, price sheets, and preferred buyers.',
    icon: Store,
    Component: Buyers,
  },
  {
    path: 'products',
    navLabel: 'Products',
    description: 'SKU catalog, buyer price grid, tiers, and margin suggestions.',
    icon: Package,
    Component: Products,
  },
  {
    path: 'purchases',
    navLabel: 'Purchases',
    description: 'Log buys from sellers with line items and running totals.',
    icon: TrendingDown,
    Component: Purchases,
  },
  {
    path: 'sales',
    navLabel: 'Sales',
    description: 'Record sales to buyers and keep history in one place.',
    icon: TrendingUp,
    Component: Sales,
  },
  {
    path: 'profile',
    navLabel: 'Profile',
    description: 'Your business info and local data backup.',
    icon: User,
    Component: Profile,
  },
];

export function appShellHref(segment: string) {
  return `/${segment}`;
}

export const APP_SHELL_DEFAULT_HREF = appShellHref('dashboard');
