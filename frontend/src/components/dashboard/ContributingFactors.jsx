export default function ContributingFactors() {
  const factors = [
    { name: 'High SABA (Rescue Inhaler) Use (>2/week)', weight: 90, color: 'bg-rose-500' },
    { name: 'Nighttime Awakenings (due to asthma)', weight: 85, color: 'bg-rose-500' },
    { name: 'Non-adherence to Controller Inhaler', weight: 75, color: 'bg-amber-500' },
    { name: 'Activity Limitations', weight: 60, color: 'bg-amber-500' },
    { name: 'AQI (High PM2.5)', weight: 45, color: 'bg-emerald-500' }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <h3 className="font-semibold text-lg text-slate-100 mb-6">Key Risk Drivers</h3>
      <div className="space-y-4">
        {factors.map((factor, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300">{factor.name}</span>
              <span className="text-slate-400">{factor.weight}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${factor.color}`} 
                style={{ width: `${factor.weight}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
