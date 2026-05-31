import { useEffect, useMemo, useState } from 'react';
import { SK, loadJson, saveJson } from '../lib/localData';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import Modal, { ModalActions } from '../components/Modal';
import IconButton from '../components/IconButton';
import SearchField from '../components/SearchField';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    notes: '',
  });

  useEffect(() => {
    setCustomers(loadJson<any[]>(SK.customers, []));
  }, []);

  const persist = (next: any[]) => {
    setCustomers(next);
    saveJson(SK.customers, next);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        String(c.phone || '').includes(q) ||
        String(c.email || '').toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      persist(
        customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...formData, id: c.id } : c
        )
      );
    } else {
      persist([...customers, { id: crypto.randomUUID(), ...formData }]);
    }
    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
    showToast(editingCustomer ? 'Seller updated' : 'Seller added');
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      country: customer.country || 'USA',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Remove seller',
      message: 'This seller will be removed from your list. Purchases already logged will keep their saved names.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    persist(customers.filter((c) => c.id !== id));
    showToast('Seller removed');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      notes: '',
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
  };

  return (
    <div>
      <PageHeader
        description="People you buy test strips from — online or in person."
        actions={
          <button
            onClick={() => {
              setEditingCustomer(null);
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Seller
          </button>
        }
      />

      <div className="mb-4">
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search sellers…" />
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No sellers yet"
          description="Add someone you buy strips from so you can log purchases against them."
          action={
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Seller
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
        <div className="card">
        <ul className="divide-y divide-slate-100">
          {filtered.map((customer) => (
            <li key={customer.id} className="card-body transition-colors hover:bg-slate-50/80">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{customer.phone}</p>
                  {customer.email && <p className="text-sm text-slate-500">{customer.email}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton label="Edit seller" onClick={() => handleEdit(customer)}>
                    <Edit className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Remove seller" variant="danger" onClick={() => handleDelete(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} title={editingCustomer ? 'Edit Seller' : 'Add Seller'} size="sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">First Name</label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Last Name</label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-field">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-field">City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">ZIP</label>
                <input type="text" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-field">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="input-field" />
            </div>
          </div>
          <ModalActions>
            <button type="submit" className="btn-primary">
              {editingCustomer ? 'Update' : 'Create'}
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
