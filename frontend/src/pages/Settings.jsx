export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400">Manage your AsthmaGuard AI preferences and clinical threshold parameters.</p>
      </header>
      
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-8">
        
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700/50 pb-2">AI Alert Thresholds</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Critical Risk Cutoff (%)</span>
              <input type="number" defaultValue={70} className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Warning Risk Cutoff (%)</span>
              <input type="number" defaultValue={40} className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700/50 pb-2">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900" />
              Enable push notifications for critical alerts
            </label>
            <label className="flex items-center gap-3 text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900" />
              Enable email summaries
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium rounded-xl transition-all">
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
