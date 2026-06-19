export default function StatsCard({ title, value, icon: Icon, trend, trendUp, colorClass = "text-emerald-400" }) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-slate-100">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-900/50 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-500 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );
}
