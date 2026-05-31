import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SK, loadJson, getProductCatalog, loadBuyersOrSeed } from '../lib/localData';
import { Link } from 'react-router-dom';
import { Users, Package, TrendingUp, TrendingDown, DollarSign, UserRound, Store, LineChart, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const location = useLocation();

  const stats = useMemo(() => {
    const customers = loadJson<any[]>(SK.customers, []);
    const buyers = loadBuyersOrSeed();
    const products = getProductCatalog().filter((p) => p.isActive !== false);
    const purchases = loadJson<any[]>(SK.purchases, []);
    const sales = loadJson<any[]>(SK.sales, []);

    const totalPurchases = purchases.reduce((s, p) => s + Number(p.totalAmount || 0), 0);
    const totalSales = sales.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
    const profit = totalSales - totalPurchases;
    const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

    const recentPurchases = [...purchases]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);
    const recentSales = [...sales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);

    return {
      counts: {
        customers: { total: customers.length },
        buyers: { total: buyers.length },
        products: { active: products.length },
      },
      financials: {
        totalSales,
        totalPurchases,
        profit,
        profitMargin,
      },
      recentActivity: { purchases: recentPurchases, sales: recentSales },
    };
  }, [location.key]);

  const owner = loadJson<Record<string, string>>(SK.profile, {});

  const statCards = [
    {
      name: 'Total Customers',
      value: stats.counts.customers.total,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Buyers',
      value: stats.counts.buyers.total,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Active Products',
      value: stats.counts.products.active,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.financials.totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Purchases',
      value: `$${stats.financials.totalPurchases.toFixed(2)}`,
      icon: TrendingDown,
      color: 'bg-red-500',
    },
    {
      name: 'Profit',
      value: `$${stats.financials.profit.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Profit Margin',
      value: `${stats.financials.profitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
  ];

  const featureItems = [
    {
      title: 'Business profile',
      description: 'Edit the name and contact info used across your dashboard.',
      to: '/profile',
      icon: UserRound,
    },
    {
      title: 'Sellers & suppliers',
      description: 'Track people you buy strips from (online or in person).',
      to: '/customers',
      icon: Users,
    },
    {
      title: 'Buyers',
      description: 'Manage resale partners, price sheets, and preferred buyers.',
      to: '/buyers',
      icon: Store,
    },
    {
      title: 'Products & price grid',
      description:
        'Full SKU list (strips with NDCs, CGM, lancets, insulin), tier prices, ding deductions, and margin-based buy suggestions.',
      to: '/products',
      icon: Package,
    },
    {
      title: 'Purchases',
      description: 'Log buys from sellers with line items and running totals.',
      to: '/purchases',
      icon: TrendingDown,
    },
    {
      title: 'Sales',
      description: 'Record sales to buyers and keep history in one place.',
      to: '/sales',
      icon: LineChart,
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {owner.firstName ? `Welcome, ${owner.firstName} ${owner.lastName || ''}`.trim() : 'Dashboard'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">Overview of your business (saved in this browser only)</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Purchases</h3>
            <div className="space-y-4">
              {stats.recentActivity.purchases.length === 0 ? (
                <p className="text-sm text-gray-500">No recent purchases</p>
              ) : (
                stats.recentActivity.purchases.map((purchase: any) => (
                  <div key={purchase.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {purchase.customer?.firstName} {purchase.customer?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">${Number(purchase.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
            <div className="space-y-4">
              {stats.recentActivity.sales.length === 0 ? (
                <p className="text-sm text-gray-500">No recent sales</p>
              ) : (
                stats.recentActivity.sales.map((sale: any) => (
                  <div key={sale.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sale.buyer?.firstName} {sale.buyer?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{format(new Date(sale.saleDate), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">${Number(sale.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Striply features</h2>
        <p className="text-sm text-gray-600 mb-4 max-w-3xl">
          Local-first workspace for diabetic supply resale: catalog and buyer pricing live in your browser—no server login
          required.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureItems.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-primary-300 hover:shadow transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-medium text-gray-900 group-hover:text-primary-800">
                    {f.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-1 text-xs text-gray-600 leading-snug">{f.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          <Link
            to="/sell"
            className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Open public seller landing page
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
