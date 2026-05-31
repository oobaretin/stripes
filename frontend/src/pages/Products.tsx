import { useEffect, useMemo, useState } from 'react';
import { SK, loadCategoriesOrSeed, loadBuyersOrSeed, saveJson } from '../lib/localData';
import { SEED_CATEGORIES } from '../lib/seedCategoriesData';
import { ChevronDown, ChevronRight, AlertCircle, TrendingUp, DollarSign, Settings } from 'lucide-react';

export default function Products() {
  const [categories, setCategories] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(() => {
    const saved = localStorage.getItem('striply_profit_margin');
    return saved ? parseFloat(saved) : 20; // Default 20% profit margin
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('striply_selected_buyer_ids');
      if (!raw) return new Set();
      const ids = JSON.parse(raw);
      if (!Array.isArray(ids)) return new Set();
      return new Set(ids.filter((v) => typeof v === 'string'));
    } catch {
      return new Set();
    }
  });
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 639px)').matches;
  });
  const [showAllBuyerColumns, setShowAllBuyerColumns] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 639px)').matches;
  });
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!openInfoKey) return;

    const onDocClick = () => setOpenInfoKey(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenInfoKey(null);
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openInfoKey]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // If there is no saved selection, default to preferred buyers (if any exist).
    // Empty selection means "show all" (so we only set a default when we have preferreds).
    const hasSaved = Boolean(localStorage.getItem('striply_selected_buyer_ids'));
    if (hasSaved) return;

    const preferred = buyers.filter((b) => Boolean(b?.isPreferred) && typeof b?.id === 'string').map((b) => b.id);
    if (preferred.length > 0) {
      setSelectedBuyerIds(new Set(preferred));
      localStorage.setItem('striply_selected_buyer_ids', JSON.stringify(preferred));
    }
  }, [buyers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsSmallScreen(e.matches);
      // When switching to mobile, default to compact columns; when leaving mobile, show all.
      setShowAllBuyerColumns(!e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const prioritizedBuyers = useMemo(() => {
    const list = [...buyers];
    list.sort((a, b) => {
      const pref = Number(Boolean(b.isPreferred)) - Number(Boolean(a.isPreferred));
      if (pref !== 0) return pref;
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
    return list;
  }, [buyers]);

  const displayCategories = useMemo(() => categories, [categories]);

  const loadData = () => {
    setError(null);
    setLoading(true);
    try {
      const categoriesData = loadCategoriesOrSeed();
      const buyersData = loadBuyersOrSeed().filter((b: any) => b?.isActive !== false);

      setCategories(categoriesData || []);
      const firstCat = (categoriesData || [])[0];
      if (firstCat?.id) {
        setExpandedCategories(new Set([firstCat.id]));
      }

      setBuyers(buyersData || []);
    } catch {
      setError('Could not load saved data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDefaultCatalog = () => {
    if (
      !confirm(
        'Replace your in-browser product catalog with the default categories, products, and sample buyer prices? This overwrites the current category tree.'
      )
    ) {
      return;
    }
    const next = JSON.parse(JSON.stringify(SEED_CATEGORIES)) as any[];
    saveJson(SK.categories, next);
    setCategories(next);
    if (next[0]?.id) setExpandedCategories(new Set([next[0].id]));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubCategory = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId);
    } else {
      newExpanded.add(subCategoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  const getBuyerPrice = (product: any, buyerName: string) => {
    const price = product.buyerPrices?.find(
      (bp: any) => `${bp.buyer.firstName} ${bp.buyer.lastName}` === buyerName
    );
    return price;
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '-';
    return `$${price.toFixed(2)}`;
  };

  const InfoButton = ({ infoKey, title, body }: { infoKey: string; title: string; body: string }) => {
    const isOpen = openInfoKey === infoKey;
    return (
      <span className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label={title}
          className="ml-1 inline-flex items-center justify-center rounded hover:bg-gray-100 p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            setOpenInfoKey((k) => (k === infoKey ? null : infoKey));
          }}
        >
          <AlertCircle className="h-3 w-3 text-gray-400" />
        </button>

        {isOpen && (
          <div
            role="dialog"
            aria-label={title}
            className="absolute left-0 top-full mt-1 z-[200] w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap">{body}</div>
          </div>
        )}
      </span>
    );
  };

  const renderBuyerPriceCell = (buyerPrice: any) => {
    if (!buyerPrice) return <span className="text-xs text-gray-400">-</span>;

    const lines: Array<{ label: string; value: number; className: string }> = [];
    if (buyerPrice.expirationRange1Price !== null && buyerPrice.expirationRange1Price !== undefined) {
      lines.push({ label: 'R1', value: buyerPrice.expirationRange1Price, className: 'text-green-600' });
    }
    if (buyerPrice.expirationRange2Price !== null && buyerPrice.expirationRange2Price !== undefined) {
      lines.push({ label: 'R2', value: buyerPrice.expirationRange2Price, className: 'text-blue-600' });
    }
    if (buyerPrice.expirationRange3Price !== null && buyerPrice.expirationRange3Price !== undefined) {
      lines.push({ label: 'R3', value: buyerPrice.expirationRange3Price, className: 'text-indigo-600' });
    }
    if (buyerPrice.expirationRange4Price !== null && buyerPrice.expirationRange4Price !== undefined) {
      lines.push({ label: 'R4', value: buyerPrice.expirationRange4Price, className: 'text-purple-600' });
    }

    return (
      <div className="flex flex-col space-y-1">
        {lines.map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">{l.label}:</span>
            <span className={`text-sm font-semibold ${l.className}`}>{formatPrice(l.value)}</span>
            <InfoButton
              infoKey={`bp:${buyerPrice.id}:${l.label}`}
              title={`${l.label} expiration range`}
              body={
                l.label === 'R1'
                  ? buyerPrice.expirationRange1Label || 'Range 1'
                  : l.label === 'R2'
                    ? buyerPrice.expirationRange2Label || 'Range 2'
                    : l.label === 'R3'
                      ? buyerPrice.expirationRange3Label || 'Range 3'
                      : buyerPrice.expirationRange4Label || 'Range 4'
              }
            />
          </div>
        ))}

        {buyerPrice.dingReductionPrice !== null && buyerPrice.dingReductionPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Ding:</span>
            <span className="text-xs text-gray-700">{formatPrice(buyerPrice.dingReductionPrice)}</span>
            <InfoButton
              infoKey={`bp:${buyerPrice.id}:ding`}
              title="Ding reduction"
              body="This is the amount to subtract from the mint price for dinged/acceptable-damage boxes (per the buyer’s sheet)."
            />
          </div>
        )}

        {buyerPrice.damagedPrice !== null && buyerPrice.damagedPrice !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">Dam:</span>
            <span className="text-xs font-semibold text-rose-600">{formatPrice(buyerPrice.damagedPrice)}</span>
            <InfoButton
              infoKey={`bp:${buyerPrice.id}:damaged`}
              title="Damaged price"
              body="Buyer’s price for damaged boxes (when provided on the sheet)."
            />
          </div>
        )}
      </div>
    );
  };

  // Profit optimization utilities
  const getBestBuyerPrice = (product: any, expirationRange: 'range1' | 'range2' = 'range1') => {
    if (!product.buyerPrices || product.buyerPrices.length === 0) return null;

    let bestPrice = 0;
    let bestBuyerPriceObj = null;

    product.buyerPrices.forEach((bp: any) => {
      const price = expirationRange === 'range1' 
        ? bp.expirationRange1Price 
        : bp.expirationRange2Price;
      
      if (price && price > bestPrice) {
        bestPrice = price;
        bestBuyerPriceObj = bp;
      }
    });

    return bestPrice > 0 && bestBuyerPriceObj 
      ? { price: bestPrice, buyer: bestBuyerPriceObj.buyer, buyerPriceObj: bestBuyerPriceObj } 
      : null;
  };

  const calculateRecommendedPurchasePrice = (salePrice: number, profitMargin: number) => {
    // Recommended purchase price = Sale price / (1 + profit margin / 100)
    // This ensures you get the desired profit margin when selling
    return salePrice / (1 + profitMargin / 100);
  };

  const calculateProfitMargin = (purchasePrice: number, salePrice: number) => {
    if (!purchasePrice || !salePrice) return null;
    return ((salePrice - purchasePrice) / purchasePrice) * 100;
  };

  const getRecommendedPurchasePrice = (product: any) => {
    const bestPriceRange1 = getBestBuyerPrice(product, 'range1');
    const bestPriceRange2 = getBestBuyerPrice(product, 'range2');

    const recommendations = [];

    if (bestPriceRange1) {
      recommendations.push({
        expirationRange: 'range1',
        label: bestPriceRange1.buyerPriceObj?.expirationRange1Label || 'Range 1',
        buyerPrice: bestPriceRange1.price,
        buyerName: `${bestPriceRange1.buyer?.firstName} ${bestPriceRange1.buyer?.lastName}`,
        recommendedPurchasePrice: calculateRecommendedPurchasePrice(bestPriceRange1.price, profitMarginPercent),
        profitMargin: profitMarginPercent,
        isPreferred: bestPriceRange1.buyer?.isPreferred || false,
      });
    }

    if (bestPriceRange2 && bestPriceRange2.price !== bestPriceRange1?.price) {
      recommendations.push({
        expirationRange: 'range2',
        label: bestPriceRange2.buyerPriceObj?.expirationRange2Label || 'Range 2',
        buyerPrice: bestPriceRange2.price,
        buyerName: `${bestPriceRange2.buyer?.firstName} ${bestPriceRange2.buyer?.lastName}`,
        recommendedPurchasePrice: calculateRecommendedPurchasePrice(bestPriceRange2.price, profitMarginPercent),
        profitMargin: profitMarginPercent,
        isPreferred: bestPriceRange2.buyer?.isPreferred || false,
      });
    }

    return recommendations;
  };

  const handleProfitMarginChange = (value: number) => {
    setProfitMarginPercent(value);
    localStorage.setItem('striply_profit_margin', value.toString());
  };

  // Get all buyers for comparison - show all active buyers, not just those with prices
  const getAllBuyersForComparison = () => {
    // Sort buyers: Preferred first, then Northeast Medical Exchange, then others alphabetically
    return [...buyers].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`;
      const bName = `${b.firstName} ${b.lastName}`;
      
      // Preferred buyers first
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;
      
      // Northeast Medical Exchange next
      if (aName === 'Northeast Medical Exchange') return -1;
      if (bName === 'Northeast Medical Exchange') return 1;
      
      // Then alphabetically
      return aName.localeCompare(bName);
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading products</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Products</h2>
            <p className="mt-2 text-sm text-gray-600">
              Full Northeast-style catalog: NDC-level SKUs, expiration tiers (R1/R2), ding adjustments, and special buyer
              notes. Other buyers show scaled sample prices for comparison—Northeast Medical Exchange matches the sheet
              values.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDefaultCatalog}
              className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Load default catalog
            </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Profit Margin: {profitMarginPercent}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={profitMarginPercent}
                  onChange={(e) => handleProfitMarginChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This determines the recommended purchase price from sellers. Higher margin = lower purchase price recommendations.
                </p>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Buyer columns</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const preferred = prioritizedBuyers.filter((b) => b?.isPreferred).map((b) => b.id);
                          const next = new Set(preferred);
                          setSelectedBuyerIds(next);
                          localStorage.setItem('striply_selected_buyer_ids', JSON.stringify([...next]));
                        }}
                        className="text-xs font-medium text-primary-700 hover:text-primary-900"
                      >
                        Preferred
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBuyerIds(new Set());
                          localStorage.removeItem('striply_selected_buyer_ids');
                        }}
                        className="text-xs font-medium text-primary-700 hover:text-primary-900"
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Choose which buyer columns to show. Default is preferred buyers.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(prioritizedBuyers.length > 0 ? prioritizedBuyers : getAllBuyersForComparison()).map((b) => {
                      const name = `${b.firstName} ${b.lastName}`.trim();
                      const checked = selectedBuyerIds.size === 0 ? true : selectedBuyerIds.has(b.id);
                      return (
                        <label key={b.id} className="flex items-center gap-2 text-sm text-gray-800">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(selectedBuyerIds);
                              if (selectedBuyerIds.size === 0) {
                                // If we were showing "all", start from all checked and then apply this change.
                                (prioritizedBuyers.length > 0 ? prioritizedBuyers : getAllBuyersForComparison()).forEach((x) => next.add(x.id));
                              }
                              if (e.target.checked) next.add(b.id);
                              else next.delete(b.id);

                              setSelectedBuyerIds(next);
                              localStorage.setItem('striply_selected_buyer_ids', JSON.stringify([...next]));
                            }}
                          />
                          <span className="truncate">
                            {name} {b.isPreferred ? <span className="text-[10px] text-yellow-700">(preferred)</span> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {displayCategories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No categories or products found.</p>
            <p className="text-sm text-gray-400 mb-2">
              Your database needs to be seeded with product data.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>If deployed on Railway, run these commands:</p>
              <div className="bg-gray-100 p-3 rounded mt-2 text-left max-w-md mx-auto">
                <code className="block mb-1">railway run npm run seed:buyers</code>
                <code className="block">railway run npm run seed:categories</code>
              </div>
              <p className="mt-2">Or use Railway Dashboard → Backend Service → Run Command</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayCategories.map((category) => {
              // Get expiration range labels from first product's buyer price (Northeast Medical)
              const firstProduct = category.subCategories?.[0]?.products?.[0];
              const firstPrice = firstProduct?.buyerPrices?.find(
                (bp: any) => `${bp.buyer.firstName} ${bp.buyer.lastName}` === 'Northeast Medical Exchange'
              );
              const range1Label = firstPrice?.expirationRange1Label || category.expirationRange1Label || '';
              const range2Label = firstPrice?.expirationRange2Label || category.expirationRange2Label || '';
              const range3Label = firstPrice?.expirationRange3Label || '';
              const range4Label = firstPrice?.expirationRange4Label || '';

              return (
                <div key={category.id} className="border-b border-gray-200">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                        {category.description && (
                          <p className="text-xs text-gray-600 mt-1 max-w-2xl">{category.description}</p>
                        )}
                        {(range1Label || range2Label || range3Label || range4Label) && (
                          <div className="flex gap-4 mt-1 text-xs text-gray-600">
                            {range1Label && <span>Range 1: {range1Label}</span>}
                            {range2Label && <span>Range 2: {range2Label}</span>}
                            {range3Label && <span>Range 3: {range3Label}</span>}
                            {range4Label && <span>Range 4: {range4Label}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Sub-Categories */}
                  {expandedCategories.has(category.id) && category.subCategories && (
                    <div className="bg-gray-50">
                      {category.subCategories
                        .filter((sc: any) => String(sc?.name ?? '').trim().toLowerCase() !== 'lancing devices and lancets')
                        .map((subCategory: any) => (
                        <div key={subCategory.id} className="border-t border-gray-200">
                          {/* Sub-Category Header */}
                          <button
                            onClick={() => toggleSubCategory(subCategory.id)}
                            className="w-full px-8 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              {expandedSubCategories.has(subCategory.id) ? (
                                <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <h3 className="text-md font-medium text-gray-800">{subCategory.name}</h3>
                              {subCategory.description && (
                                <span className="ml-3 text-xs text-gray-500">({subCategory.description})</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {subCategory.products?.length || 0} products
                            </span>
                          </button>

                          {/* Products */}
                          {expandedSubCategories.has(subCategory.id) && subCategory.products && (() => {
                            // Prefer showing preferred buyers first on mobile
                            const allBuyers = (prioritizedBuyers.length > 0 ? prioritizedBuyers : getAllBuyersForComparison());
                            const filteredBuyers = selectedBuyerIds.size > 0 ? allBuyers.filter((b) => selectedBuyerIds.has(b.id)) : allBuyers;
                            const visibleBuyers = showAllBuyerColumns || !isSmallScreen ? filteredBuyers : filteredBuyers.slice(0, 2);
                            
                            return (
                            <div className="bg-white border-t border-gray-200">
                              <div className="px-4 sm:px-8 py-4">
                                {isSmallScreen && filteredBuyers.length > 2 && (
                                  <div className="mb-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Showing {showAllBuyerColumns ? filteredBuyers.length : 2} of {filteredBuyers.length} buyers
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowAllBuyerColumns((v) => !v)}
                                      className="text-xs font-medium text-primary-700 hover:text-primary-900"
                                    >
                                      {showAllBuyerColumns ? 'Show fewer columns' : 'Show all buyers'}
                                    </button>
                                  </div>
                                )}
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                                          Product Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                          NDC Code
                                        </th>
                                        {visibleBuyers.map((buyer) => (
                                          <th key={buyer.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                            <div className="flex flex-col">
                                              <div className="flex items-center gap-1">
                                                <span className="font-semibold">{buyer.firstName} {buyer.lastName}</span>
                                                {buyer.isPreferred && (
                                                  <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded" title="Preferred Buyer">★</span>
                                                )}
                                              </div>
                                              {range1Label && <span className="text-[10px] font-normal text-gray-400 mt-0.5">{range1Label}</span>}
                                              {range2Label && <span className="text-[10px] font-normal text-gray-400">{range2Label}</span>}
                                              {range3Label && <span className="text-[10px] font-normal text-gray-400">{range3Label}</span>}
                                              {range4Label && <span className="text-[10px] font-normal text-gray-400">{range4Label}</span>}
                                            </div>
                                          </th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 min-w-[180px]">
                                          <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                              <DollarSign className="h-3.5 w-3.5 text-green-600" />
                                              <span className="font-semibold">Recommended Purchase Price</span>
                                            </div>
                                            <span className="text-[10px] font-normal text-gray-400 mt-0.5">
                                              Target: {profitMarginPercent}% profit
                                            </span>
                                          </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                          Notes
                                        </th>
                                        
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {subCategory.products.map((product: any) => {

                                        return (
                                          <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                              <div className="text-sm font-medium text-gray-900">
                                                {product.name}
                                              </div>
                                              {product.brand && (
                                                <div className="text-xs text-gray-500 mt-0.5">Brand: {product.brand}</div>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm text-gray-900 font-mono">
                                                {product.ndcCode || '-'}
                                              </span>
                                            </td>
                                            {visibleBuyers.map((buyer) => {
                                              const buyerPrice = getBuyerPrice(product, `${buyer.firstName} ${buyer.lastName}`);
                                              return (
                                                <td key={buyer.id} className="px-4 py-3">
                                                  {renderBuyerPriceCell(buyerPrice)}
                                                </td>
                                              );
                                            })}
                                            <td className="px-4 py-3 bg-green-50">
                                              {(() => {
                                                const recommendations = getRecommendedPurchasePrice(product);
                                                if (recommendations.length === 0) {
                                                  return <span className="text-xs text-gray-400">No buyer prices</span>;
                                                }
                                                
                                                return (
                                                  <div className="flex flex-col space-y-2">
                                                    {recommendations.map((rec, idx) => {
                                                      const bestPrice = getBestBuyerPrice(product, rec.expirationRange as 'range1' | 'range2');
                                                      const isBest = idx === 0; // First recommendation is usually the best
                                                      
                                                      return (
                                                        <div
                                                          key={idx}
                                                          className={`relative p-2 rounded border ${
                                                            isBest
                                                              ? 'bg-green-100 border-green-300'
                                                              : 'bg-white border-gray-200'
                                                          }`}
                                                        >
                                                          <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-semibold text-gray-700">
                                                              {rec.label}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                              {isBest && (
                                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                                              )}
                                                              <InfoButton
                                                                infoKey={`rec:${product.id}:${idx}`}
                                                                title="Recommended Purchase Price"
                                                                body={`This is the maximum price you should pay sellers to achieve your target profit margin (${rec.profitMargin}%) when selling to buyers.\n\nCalculation:\nRecommended = ${formatPrice(rec.buyerPrice)} ÷ (1 + ${rec.profitMargin}% / 100) = ${formatPrice(rec.recommendedPurchasePrice)}\n\nResult:\nBuy at ${formatPrice(rec.recommendedPurchasePrice)}, sell at ${formatPrice(rec.buyerPrice)} to ${rec.buyerName} for ${rec.profitMargin}% profit (${formatPrice(rec.buyerPrice - rec.recommendedPurchasePrice)} per unit).`}
                                                              />
                                                            </div>
                                                          </div>
                                                          <div className="text-sm font-bold text-green-700 mb-0.5">
                                                            {formatPrice(rec.recommendedPurchasePrice)}
                                                          </div>
                                                          <div className="text-xs text-gray-600">
                                                            Best buyer: {rec.buyerName}
                                                            {rec.isPreferred && (
                                                              <span className="ml-1 text-yellow-600">★</span>
                                                            )}
                                                          </div>
                                                          <div className="text-xs text-gray-500 mt-0.5">
                                                            Sell at: {formatPrice(rec.buyerPrice)} → Profit: {rec.profitMargin}% ({formatPrice(rec.buyerPrice - rec.recommendedPurchasePrice)})
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                              {product.specialNotes ? (
                                                <div className="flex items-center">
                                                  <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                                                  <span className="text-xs font-medium text-amber-700">
                                                    {product.specialNotes}
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
