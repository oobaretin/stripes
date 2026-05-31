import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SK, loadJson, saveJson, getProductCatalog } from '../lib/localData';
import { Plus, Edit, Trash2, Globe, UserRound } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import Modal, { ModalActions } from '../components/Modal';
import IconButton from '../components/IconButton';
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

  const closeModal = () => {
    setShowModal(false);
    setEditingPurchase(null);
    resetForm();
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
            className="btn-primary"
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
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase
            </button>
          }
        />
      ) : (
        <div className="card">
          <ul className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <li key={purchase.id} className="card-body transition-colors hover:bg-slate-50/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {purchase.customer.firstName} {purchase.customer.lastName}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">
                        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {purchase.purchaseMethod === 'online' ? (
                          <>
                            <Globe className="h-3.5 w-3.5" aria-hidden />
                            Online
                          </>
                        ) : (
                          <>
                            <UserRound className="h-3.5 w-3.5" aria-hidden />
                            In person
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      ${purchase.totalAmount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      <IconButton label="Edit purchase" onClick={() => handleEdit(purchase)}>
                        <Edit className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Delete purchase" variant="danger" onClick={() => handleDelete(purchase.id)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="form-error" role="alert">
              {formError}
              {customers.length === 0 && (
                <>
                  {' '}
                  <Link to="/customers" className="font-medium underline" onClick={closeModal}>
                    Add a seller
                  </Link>
                </>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="label-field">Seller / Supplier *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => {
                  setFormError(null);
                  setFormData({ ...formData, customerId: e.target.value });
                }}
                className="input-field"
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
                  <Link to="/customers" className="font-medium underline" onClick={closeModal}>
                    Add one on the Sellers page
                  </Link>{' '}
                  first.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Purchase Method</label>
                <select
                  value={formData.purchaseMethod}
                  onChange={(e) => setFormData({ ...formData, purchaseMethod: e.target.value })}
                  className="input-field"
                >
                  <option value="in-person">In person</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-field mb-2">Items</label>
              {formData.items.map((item, index) => (
                <div key={index} className="line-item-box">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">Item {index + 1}</span>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="btn-danger-text">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-field-xs">Product *</label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="input-field"
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
                      <label className="label-field-xs">Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field-xs">Unit Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field-xs">Expiration Date</label>
                      <input
                        type="date"
                        value={item.expirationDate}
                        onChange={(e) => updateItem(index, 'expirationDate', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label-field-xs">Lot Number</label>
                      <input
                        type="text"
                        value={item.lotNumber}
                        onChange={(e) => updateItem(index, 'lotNumber', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                + Add item
              </button>
            </div>
            <div>
              <label className="label-field">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-field"
              />
            </div>
          </div>
          <ModalActions>
            <button type="submit" className="btn-primary">
              {editingPurchase ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}

