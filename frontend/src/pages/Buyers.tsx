import { useEffect, useMemo, useState } from 'react';
import { SK, loadBuyersOrSeed, saveJson } from '../lib/localData';
import { SEED_BUYERS } from '../lib/seedBuyersData';
import { Plus, Edit, Trash2, Star, ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import SearchField from '../components/SearchField';
import IconButton from '../components/IconButton';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export default function Buyers() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [buyers, setBuyers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    paymentEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    priceSheetUrl: '',
    bestFormOfContact: '',
    facebookLink: '',
    removeLabels: false,
    reachOutPriorToInvoicing: false,
    paymentMethods: '',
    isPreferred: false,
    notes: '',
  });

  useEffect(() => {
    setBuyers(loadBuyersOrSeed());
  }, []);

  const persist = (next: any[]) => {
    setBuyers(next);
    saveJson(SK.buyers, next);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return buyers;
    return buyers.filter(
      (b) =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
        String(b.phone || '').includes(q) ||
        String(b.email || '').toLowerCase().includes(q)
    );
  }, [buyers, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuyer) {
      persist(buyers.map((b) => (b.id === editingBuyer.id ? { ...b, ...formData, id: b.id } : b)));
    } else {
      persist([...buyers, { id: crypto.randomUUID(), ...formData }]);
    }
    setShowModal(false);
    setEditingBuyer(null);
    resetForm();
    showToast(editingBuyer ? 'Buyer updated' : 'Buyer added');
  };

  const handleEdit = (buyer: any) => {
    setEditingBuyer(buyer);
    setFormData({
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      email: buyer.email || '',
      paymentEmail: buyer.paymentEmail || '',
      phone: buyer.phone,
      address: buyer.address || '',
      city: buyer.city || '',
      state: buyer.state || '',
      zipCode: buyer.zipCode || '',
      country: buyer.country || 'USA',
      priceSheetUrl: buyer.priceSheetUrl || '',
      bestFormOfContact: buyer.bestFormOfContact || '',
      facebookLink: buyer.facebookLink || '',
      removeLabels: buyer.removeLabels || false,
      reachOutPriorToInvoicing: buyer.reachOutPriorToInvoicing || false,
      paymentMethods: buyer.paymentMethods || '',
      isPreferred: buyer.isPreferred || false,
      notes: buyer.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Remove buyer',
      message: 'This buyer will be removed from your list.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    persist(buyers.filter((b) => b.id !== id));
    showToast('Buyer removed');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      paymentEmail: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      priceSheetUrl: '',
      bestFormOfContact: '',
      facebookLink: '',
      removeLabels: false,
      reachOutPriorToInvoicing: false,
      paymentMethods: '',
      isPreferred: false,
      notes: '',
    });
  };

  const handleAddDefaultBuyers = () => {
    const existingIds = new Set(buyers.map((b) => b.id));
    const toAdd = SEED_BUYERS.filter((b) => !existingIds.has(b.id)).map((b) => ({ ...b }));
    if (toAdd.length === 0) {
      showToast('All default buyers are already in your list.');
      return;
    }
    persist([...buyers, ...toAdd]);
    showToast(`Added ${toAdd.length} default buyer${toAdd.length === 1 ? '' : 's'}`);
  };

  return (
    <div>
      <PageHeader
        description="Manage resale partners, price sheets, and preferred buyers."
        actions={
          <>
            <button
              type="button"
              onClick={handleAddDefaultBuyers}
              className="btn-secondary"
            >
              Add default buyers
            </button>
            <button
              onClick={() => {
                setEditingBuyer(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Buyer
            </button>
          </>
        }
      />

      <div className="mb-4">
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search buyers…" />
      </div>

      {buyers.length === 0 ? (
        <EmptyState
          title="No buyers yet"
          description="Add resale partners or load the default buyer list to compare price sheets."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleAddDefaultBuyers}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50"
              >
                Add default buyers
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBuyer(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Buyer
              </button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
      <div className="card">
        <ul className="divide-y divide-slate-100">
          {filtered.map((buyer) => (
              <li key={buyer.id} className="card-body transition-colors hover:bg-slate-50/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {buyer.firstName} {buyer.lastName}
                        </p>
                        {buyer.isPreferred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{buyer.phone}</p>
                      {buyer.paymentEmail && (
                        <p className="text-sm text-slate-500">Payment: {buyer.paymentEmail}</p>
                      )}
                      {buyer.bestFormOfContact && (
                        <p className="text-xs text-slate-400">Contact: {buyer.bestFormOfContact}</p>
                      )}
                      {buyer.paymentMethods && (
                        <p className="text-xs text-slate-400">Payments: {buyer.paymentMethods}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {buyer.priceSheetUrl && buyer.priceSheetUrl.startsWith('http') && (
                        <a
                          href={buyer.priceSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-btn icon-btn-default"
                          title="Price sheet"
                          aria-label="Open price sheet"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <IconButton label="Edit buyer" onClick={() => handleEdit(buyer)}>
                        <Edit className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Remove buyer" variant="danger" onClick={() => handleDelete(buyer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingBuyer ? 'Edit Buyer' : 'Add Buyer'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Email</label>
                      <input
                        type="email"
                        value={formData.paymentEmail}
                        onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Email for payment invoices"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price Sheet URL</label>
                      <input
                        type="url"
                        value={formData.priceSheetUrl}
                        onChange={(e) => setFormData({ ...formData, priceSheetUrl: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Link to price sheet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Best Form of Contact</label>
                      <input
                        type="text"
                        value={formData.bestFormOfContact}
                        onChange={(e) => setFormData({ ...formData, bestFormOfContact: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., Email, Text, Phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Facebook Link</label>
                      <input
                        type="url"
                        value={formData.facebookLink}
                        onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Facebook profile or page URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Methods</label>
                      <input
                        type="text"
                        value={formData.paymentMethods}
                        onChange={(e) => setFormData({ ...formData, paymentMethods: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., PayPal, Wire, ACH, Venmo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="removeLabels"
                          checked={formData.removeLabels}
                          onChange={(e) => setFormData({ ...formData, removeLabels: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="removeLabels" className="ml-2 block text-sm text-gray-700">
                          Remove Labels
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="reachOutPriorToInvoicing"
                          checked={formData.reachOutPriorToInvoicing}
                          onChange={(e) => setFormData({ ...formData, reachOutPriorToInvoicing: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="reachOutPriorToInvoicing" className="ml-2 block text-sm text-gray-700">
                          Reach Out Prior to Invoicing
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPreferred"
                        checked={formData.isPreferred}
                        onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPreferred" className="ml-2 block text-sm text-gray-700">
                        Preferred Buyer
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
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
                    {editingBuyer ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBuyer(null);
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

