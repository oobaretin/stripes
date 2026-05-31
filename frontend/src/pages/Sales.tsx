import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SK, loadJson, saveJson, loadBuyersOrSeed, getProductCatalog } from '../lib/localData';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export default function Sales() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [sales, setSales] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [formData, setFormData] = useState({
    buyerId: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
  });

  const loadData = () => {
    setLoading(true);
    setSales(loadJson<any[]>(SK.sales, []));
    setBuyers(loadBuyersOrSeed().filter((b: any) => b?.isActive !== false));
    setProducts(getProductCatalog().filter((p: any) => p.isActive !== false));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const buyer = buyers.find((b) => b.id === formData.buyerId);
    if (!buyer) {
      const message =
        buyers.length === 0
          ? 'Add a buyer on the Buyers page before logging a sale.'
          : 'Select a buyer to continue.';
      setFormError(message);
      return;
    }

    const catalog = getProductCatalog();
    const rawItems = formData.items.filter((item) => item.productId && item.quantity > 0);
    if (rawItems.length === 0) {
      setFormError('Add at least one line item with a product and quantity.');
      return;
    }

    const items = rawItems.map((item) => {
      const p = catalog.find((x: any) => x.id === item.productId);
      return {
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        product: p ? { name: p.name, ndcCode: p.ndcCode } : { name: 'Unknown', ndcCode: '' },
      };
    });
    const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const payload = {
      id: editingSale?.id ?? crypto.randomUUID(),
      buyerId: formData.buyerId,
      buyer: { firstName: buyer.firstName, lastName: buyer.lastName },
      saleDate: formData.saleDate,
      notes: formData.notes,
      items,
      totalAmount,
      profit: null as number | null,
      profitMargin: null as number | null,
    };

    const next = editingSale
      ? sales.map((x) => (x.id === editingSale.id ? payload : x))
      : [...sales, payload];
    if (!saveJson(SK.sales, next)) {
      setFormError('Could not save — browser storage may be full. Try clearing old data or use another browser.');
      return;
    }
    setSales(next);
    setShowModal(false);
    setEditingSale(null);
    resetForm();
    showToast(editingSale ? 'Sale updated' : 'Sale saved');
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setFormData({
      buyerId: sale.buyerId,
      saleDate: String(sale.saleDate).split('T')[0],
      notes: sale.notes || '',
      items: sale.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete sale',
      message: 'This sale will be removed from your local records. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    const next = sales.filter((s) => s.id !== id);
    saveJson(SK.sales, next);
    setSales(next);
    showToast('Sale deleted');
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const resetForm = () => {
    setFormError(null);
    setFormData({
      buyerId: '',
      saleDate: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    });
  };

  return (
    <div>
      <PageHeader
        description="Track sales to buyers."
        actions={
          <button
            onClick={() => {
              setEditingSale(null);
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </button>
        }
      />

      {loading ? (
        <ListSkeleton rows={5} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="No sales yet"
          description="Record your first sale to a buyer and track revenue."
          action={
            <button
              type="button"
              onClick={() => {
                setEditingSale(null);
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </button>
          }
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <li key={sale.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sale.buyer.firstName} {sale.buyer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(sale.saleDate), 'MMM d, yyyy')} - ${sale.totalAmount.toFixed(2)}
                      </p>
                      {sale.profit !== null && sale.profit !== undefined && (
                        <p className={`text-xs font-medium ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Profit: ${sale.profit.toFixed(2)} ({sale.profitMargin?.toFixed(1) || '0'}%)
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(sale)} className="text-primary-600 hover:text-primary-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit} noValidate>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingSale ? 'Edit Sale' : 'Add Sale'}
                  </h3>
                  {formError && (
                    <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800" role="alert">
                      {formError}
                      {buyers.length === 0 && (
                        <>
                          {' '}
                          <Link to="/buyers" className="font-medium underline" onClick={() => setShowModal(false)}>
                            Add a buyer
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buyer *</label>
                      <select
                        required
                        value={formData.buyerId}
                        onChange={(e) => {
                          setFormError(null);
                          setFormData({ ...formData, buyerId: e.target.value });
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a buyer</option>
                        {buyers.map((buyer) => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.firstName} {buyer.lastName}
                          </option>
                        ))}
                      </select>
                      {buyers.length === 0 && (
                        <p className="mt-2 text-sm text-amber-700">
                          No buyers yet.{' '}
                          <Link to="/buyers" className="font-medium underline" onClick={() => setShowModal(false)}>
                            Add one on the Buyers page
                          </Link>{' '}
                          or use &quot;Add default buyers&quot;.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sale Date</label>
                      <input
                        type="date"
                        value={formData.saleDate}
                        onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                      {formData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Item {index + 1}</span>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Product *</label>
                              <select
                                required
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              >
                                <option value="">Select product</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Quantity *</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Unit Price *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addItem}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Item
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingSale ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSale(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

