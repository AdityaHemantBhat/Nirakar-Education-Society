import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Save, Users, Heart, ShieldCheck, Download, Plus } from 'lucide-react';

export const AccessSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    minAmount: 10,
    maxAmount: 1000,
    defaultAmount: 100,
    freeReadCountMagazine: 5,
    purposeText: '',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['access_settings_admin'],
    queryFn: async () => {
      const res = await fetch('/api/v1/access/settings');
      if (!res.ok) throw new Error('Failed to load access settings');
      const json = await res.json();
      setFormData(json.data);
      return json.data;
    },
  });

  const { data: supporters = [] } = useQuery({
    queryKey: ['admin_supporters'],
    queryFn: async () => {
      const res = await fetch('/api/v1/access/supporters');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: any) => {
      const res = await fetch('/api/v1/access/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['access_settings_admin'] });
      setTimeout(() => setSaveSuccess(false), 2000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const exportSupportersCSV = () => {
    if (!supporters.length) return;
    const headers = 'Receipt,Username,Email,Amount,Source,Date\n';
    const rows = supporters
      .map(
        (s: any) =>
          `"${s.receipt?.receiptNo || ''}","${s.user.username}","${s.user.email}",${s.amount},"${s.source}","${s.grantedAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nirakar_supporters_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="p-8 text-stone-500 font-mono text-xs">Loading monetisation rules...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Supporter Pass & Monetisation Rules
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-sans mt-1">
          Configure voluntary contributions and free school magazine reads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form Left */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Contribution Parameters
            </h2>
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-600 font-semibold">
                Settings Saved Successfully
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Min Contribution (₹)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Max Contribution (₹)
              </label>
              <input
                type="number"
                min={100}
                max={10000}
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Default Slider Value (₹)
              </label>
              <input
                type="number"
                value={formData.defaultAmount}
                onChange={(e) => setFormData({ ...formData, defaultAmount: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          {/* Metered Free Reads Allowance */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Free School Magazine Reads Before Paywall
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={formData.freeReadCountMagazine}
                onChange={(e) =>
                  setFormData({ ...formData, freeReadCountMagazine: parseInt(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-700"
              />
              <span className="text-[11px] text-stone-400 font-sans mt-0.5 block">
                Tracked per device or authenticated user
              </span>
            </div>

          </div>

          {/* Purpose Text */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
              Contribution Purpose Banner Copy
            </label>
            <textarea
              rows={3}
              value={formData.purposeText}
              onChange={(e) => setFormData({ ...formData, purposeText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-sans focus:outline-none focus:border-brand-700"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Rules & Settings</span>
          </button>
        </form>

        {/* Supporters & Export Right */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Active Supporters ({supporters.length})
            </h2>
            <button
              onClick={exportSupportersCSV}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
              title="Export CSV"
            >
              <Download size={15} />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[420px]">
            {supporters.length > 0 ? (
              supporters.map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-ink">
                    <span>{s.user.username}</span>
                    <span className="text-brand-800">₹{s.amount}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                    {s.receipt?.receiptNo} • {new Date(s.grantedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                No contributions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
