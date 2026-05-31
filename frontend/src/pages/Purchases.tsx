import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SK, loadJson, saveJson, getProductCatalog } from '../lib/localData';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export default function Purchases() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseMethod: 'in-person',
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0, expirationDate: '', lotNumber: '' }],
  });

  const loadData = () => {
    setLoading(true);
    setPurchases(loadJson<any[]>(SK.purchases, []));
    setCustomers(loadJson<any[]>(SK.customers, []));
    setProducts(getProductCatalog().filter((p: any) => p.isActive !== false));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const customer = customers.find((c) => c.id === formData.customerId);
    if (!customer) {
      const message =
        customers.length === 0
          ? 'Add a seller on the Sellers page before logging a purchase.'
          : 'Select a seller to continue.';
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
        expirationDate: item.expirationDate || null,
        lotNumber: item.lotNumber || '',
        product: p ? { name: p.name, ndcCode: p.ndcCode } : { name: 'Unknown', ndcCode: '' },
      };
    });
    const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const payload = {
      id: editingPurchase?.id ?? crypto.randomUUID(),
      customerId: formData.customerId,
      customer: { firstName: customer.firstName, lastName: customer.lastName },
      purchaseDate: formData.purchaseDate,
      purchaseMethod: formData.purchaseMethod,
      notes: formData.notes,
      items,
      totalAmount,
    };

    const next = editingPurchase
      ? purchases.map((x) => (x.id === editingPurchase.id ? payload : x))
      : [...purchases, payload];
    if (!saveJson(SK.purchases, next)) {
      setFormError('Could not save — browser storage may be full. Try clearing old data or use another browser.');
      return;
    }
    setPurchases(next);
    setShowModal(false);
    setEditingPurchase(null);
    resetForm();
    showToast(editingPurchase ? 'Purchase updated' : 'Purchase saved');
  };

  const handleEdit = (purchase: any) => {
    setEditingPurchase(purchase);
    setFormData({
      customerId: purchase.customerId,
      purchaseDate: String(purchase.purchaseDate).split('T')[0],
      purchaseMethod: purchase.purchaseMethod || 'in-person',
      notes: purchase.notes || '',
      items: purchase.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
        lotNumber: item.lotNumber || '',
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete purchase',
      message: 'This purchase will be removed from your local records. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    const next = purchases.filter((p) => p.id !== id);
    saveJson(SK.purchases, next);
    setPurchases(next);
    showToast('Purchase deleted');
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0, expirationDate: '', lotNumber: '' }],
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
      customerId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseMethod: 'in-person',
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, expirationDate: '', lotNumber: '' }],
    });
  };

  return (
    <div>
      <PageHeader
        description="Track purchases from sellers (online or in-person)."
        actions={
          <button
            onClick={() => {
              setEditingPurchase(null);
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </button>
        }
      />

      {loading ? (
        <ListSkeleton rows={5} />
      ) : purchases.length === 0 ? (
        <EmptyState
          title="No purchases yet"
          description="Log your first buy from a seller to track costs and inventory."
          action={
            <button
              type="button"
              onClick={() => {
                setEditingPurchase(null);
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase
            </button>
          }
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <li key={purchase.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {purchase.customer.firstName} {purchase.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')} - ${purchase.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''} • {purchase.purchaseMethod === 'online' ? '🌐 Online' : '👤 In-Person'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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
                    {editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
                  </h3>
                  {formError && (
                    <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800" role="alert">
                      {formError}
                      {customers.length === 0 && (
                        <>
                          {' '}
                          <Link to="/customers" className="font-medium underline" onClick={() => setShowModal(false)}>
                            Add a seller
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Seller / Supplier *</label>
                      <select
                        required
                        value={formData.customerId}
                        onChange={(e) => {
                          setFormError(null);
                          setFormData({ ...formData, customerId: e.target.value });
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a seller</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </option>
                        ))}
                      </select>
                      {customers.length === 0 && (
                        <p className="mt-2 text-sm text-amber-700">
                          No sellers yet.{' '}
                          <Link to="/customers" className="font-medium underline" onClick={() => setShowModal(false)}>
                            Add one on the Sellers page
                          </Link>{' '}
                          first.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purchase Method</label>
                      <select
                        value={formData.purchaseMethod}
                        onChange={(e) => setFormData({ ...formData, purchaseMethod: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="in-person">👤 In-Person</option>
                        <option value="online">🌐 Online</option>
                      </select>
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
                          <div className="grid grid-cols-2 gap-4">
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
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Expiration Date</label>
                              <input
                                type="date"
                                value={item.expirationDate}
                                onChange={(e) => updateItem(index, 'expirationDate', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700">Lot Number</label>
                              <input
                                type="text"
                                value={item.lotNumber}
                                onChange={(e) => updateItem(index, 'lotNumber', e.target.value)}
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
                    {editingPurchase ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPurchase(null);
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

