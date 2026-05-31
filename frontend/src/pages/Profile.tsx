import { useEffect, useRef, useState } from 'react';
import { SK, loadJson, saveJson } from '../lib/localData';
import { downloadBackup, importAllData } from '../lib/backupData';
import PageHeader from '../components/PageHeader';
import ListSkeleton from '../components/ListSkeleton';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { Download, Upload } from 'lucide-react';

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
};

export default function Profile() {
  const confirm = useConfirm();
  const showToast = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultProfile);

  useEffect(() => {
    const stored = loadJson<typeof defaultProfile>(SK.profile, defaultProfile);
    setFormData({ ...defaultProfile, ...stored });
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (!saveJson(SK.profile, formData)) {
      showToast('Could not save — browser storage may be full.');
      setSaving(false);
      return;
    }
    showToast('Profile saved in this browser.');
    setSaving(false);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const ok = await confirm({
      title: 'Import backup',
      message: 'This replaces all Striply data in this browser with the backup file. Continue?',
      confirmLabel: 'Import',
      destructive: true,
    });
    if (!ok) return;
    const result = importAllData(text);
    if (result.ok === false) {
      showToast(result.error);
      return;
    }
    showToast('Backup imported — reloading…');
    window.setTimeout(() => window.location.reload(), 600);
  };

  if (loading) {
    return <ListSkeleton rows={3} />;
  }

  return (
    <div>
      <PageHeader description="Your business information (stored locally in this browser)." />

      <div className="card">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="label-field">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label-field">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="label-field">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="phone" className="label-field">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="address" className="label-field">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="label-field">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="state" className="label-field">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="label-field">
                  ZIP
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label htmlFor="country" className="label-field">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow">
        <h3 className="text-base font-semibold text-slate-900">Data backup</h3>
        <p className="mt-1 text-sm text-slate-600">
          Export or import all Striply data stored in this browser (catalog, sellers, buyers, purchases, sales).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              downloadBackup();
              showToast('Backup downloaded');
            }}
            className="btn-secondary"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}
