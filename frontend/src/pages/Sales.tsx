import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SK, loadJson, saveJson, loadBuyersOrSeed, getProductCatalog } from '../lib/localData';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import Modal, { ModalActions } from '../components/Modal';
import IconButton from '../components/IconButton';
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

  const closeModal = () => {
    setShowModal(false);
    setEditingSale(null);
    resetForm();
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
            className="btn-primary"
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
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </button>
          }
        />
      ) : (
        <div className="card">
          <ul className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <li key={sale.id} className="card-body transition-colors hover:bg-slate-50/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {sale.buyer.firstName} {sale.buyer.lastName}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {format(new Date(sale.saleDate), 'MMM d, yyyy')}
                    </p>
                    {sale.profit !== null && sale.profit !== undefined && (
                      <p className={`mt-1 text-xs font-medium ${sale.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        Profit ${sale.profit.toFixed(2)} ({sale.profitMargin?.toFixed(1) || '0'}%)
                      </p>
                    )}
                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      ${sale.totalAmount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      <IconButton label="Edit sale" onClick={() => handleEdit(sale)}>
                        <Edit className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Delete sale" variant="danger" onClick={() => handleDelete(sale.id)}>
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

      <Modal open={showModal} onClose={closeModal} title={editingSale ? 'Edit Sale' : 'Add Sale'} size="lg">
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="form-error" role="alert">
              {formError}
              {buyers.length === 0 && (
                <>
                  {' '}
                  <Link to="/buyers" className="font-medium underline" onClick={closeModal}>
                    Add a buyer
                  </Link>
                </>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="label-field">Buyer *</label>
              <select
                required
                value={formData.buyerId}
                onChange={(e) => {
                  setFormError(null);
                  setFormData({ ...formData, buyerId: e.target.value });
                }}
                className="input-field"
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
                  <Link to="/buyers" className="font-medium underline" onClick={closeModal}>
                    Add one on the Buyers page
                  </Link>{' '}
                  or use &quot;Add default buyers&quot;.
                </p>
              )}
            </div>
            <div>
              <label className="label-field">Sale Date</label>
              <input
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="input-field"
              />
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              {editingSale ? 'Update' : 'Create'}
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

