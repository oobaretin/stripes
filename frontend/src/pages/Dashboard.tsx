import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SK, loadJson, getProductCatalog, loadBuyersOrSeed } from '../lib/localData';
import { DollarSign, TrendingDown, TrendingUp, Package, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const location = useLocation();
  const owner = loadJson<Record<string, string>>(SK.profile, {});

  const stats = useMemo(() => {
    const customers = loadJson<any[]>(SK.customers, []);
    const products = getProductCatalog().filter((p) => p.isActive !== false);
    const purchases = loadJson<any[]>(SK.purchases, []);
    const sales = loadJson<any[]>(SK.sales, []);

    const totalPurchases = purchases.reduce((s, p) => s + Number(p.totalAmount || 0), 0);
    const totalSales = sales.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
    const profit = totalSales - totalPurchases;

    const recentPurchases = [...purchases]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);
    const recentSales = [...sales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);

    return {
      counts: {
        customers: customers.length,
        products: products.length,
        purchases: purchases.length,
        sales: sales.length,
      },
      financials: { totalSales, totalPurchases, profit },
      recentActivity: { purchases: recentPurchases, sales: recentSales },
    };
  }, [location.key]);

  const welcome = owner.firstName
    ? `Welcome, ${owner.firstName}${owner.lastName ? ` ${owner.lastName}` : ''}`
    : undefined;

  const checklist = [
    { label: 'Complete your profile', done: Boolean(owner.firstName?.trim()), to: '/profile' },
    { label: 'Add a seller', done: stats.counts.customers > 0, to: '/customers' },
    { label: 'Review the product catalog', done: stats.counts.products > 0, to: '/products' },
    { label: 'Log your first purchase', done: stats.counts.purchases > 0, to: '/purchases' },
    { label: 'Log your first sale', done: stats.counts.sales > 0, to: '/sales' },
  ];

  const completedSteps = checklist.filter((s) => s.done).length;

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.financials.totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-primary-600',
    },
    {
      name: 'Total Purchases',
      value: `$${stats.financials.totalPurchases.toFixed(2)}`,
      icon: TrendingDown,
      color: 'bg-slate-600',
    },
    {
      name: 'Profit',
      value: `$${stats.financials.profit.toFixed(2)}`,
      icon: TrendingUp,
      color: stats.financials.profit >= 0 ? 'bg-green-600' : 'bg-red-600',
    },
    {
      name: 'Active Products',
      value: stats.counts.products,
      icon: Package,
      color: 'bg-primary-600',
    },
  ];

  return (
    <div>
      <PageHeader
        lead={welcome}
        description="Overview of revenue, costs, and recent activity in your local workspace."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="rounded-lg bg-white p-5 shadow">
              <div className="flex items-center gap-4">
                <div className={`shrink-0 rounded-md p-3 ${card.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <dl className="min-w-0">
                  <dt className="truncate text-sm font-medium text-slate-500">{card.name}</dt>
                  <dd className="text-lg font-semibold text-slate-900">{card.value}</dd>
                </dl>
              </div>
            </div>
          );
        })}
      </div>

      {completedSteps < checklist.length && (
        <div className="mb-8 rounded-lg border border-primary-200 bg-primary-50 p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-sm font-semibold text-primary-900">Get started</h3>
            <span className="text-xs font-medium text-primary-700">
              {completedSteps} of {checklist.length} complete
            </span>
          </div>
          <ul className="space-y-2">
            {checklist.map((step) => (
              <li key={step.to}>
                <Link
                  to={step.to}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-primary-100/80 transition-colors"
                >
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-primary-400" aria-hidden />
                  )}
                  <span className={step.done ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}>
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Purchases</h3>
            <div className="space-y-4">
              {stats.recentActivity.purchases.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No purchases yet.{' '}
                  <Link to="/purchases" className="font-medium text-primary-700 hover:underline">
                    Log a purchase
                  </Link>
                </p>
              ) : (
                stats.recentActivity.purchases.map((purchase: any) => (
                  <div key={purchase.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {purchase.customer?.firstName} {purchase.customer?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">${Number(purchase.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Sales</h3>
            <div className="space-y-4">
              {stats.recentActivity.sales.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No sales yet.{' '}
                  <Link to="/sales" className="font-medium text-primary-700 hover:underline">
                    Log a sale
                  </Link>
                </p>
              ) : (
                stats.recentActivity.sales.map((sale: any) => (
                  <div key={sale.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {sale.buyer?.firstName} {sale.buyer?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{format(new Date(sale.saleDate), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">${Number(sale.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
