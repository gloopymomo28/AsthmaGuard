import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ContributingFactors({ factors = [] }) {
  // If no dynamic factors provided, use fallback
  const data = factors.length > 0 ? factors : [
    { feature: 'High SABA Use', impact: '+25%', value: 0.25 },
    { feature: 'FEV1 Drop', impact: '+15%', value: 0.15 },
    { feature: 'Pollen Level', impact: '+10%', value: 0.10 },
    { feature: 'ICS Adherence', impact: '-20%', value: -0.20 }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <h3 className="font-semibold text-lg text-slate-100 mb-6">Explainable AI (SHAP Analysis)</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="feature" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              width={100} 
            />
            <Tooltip 
              cursor={{fill: '#1e293b'}}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              formatter={(value, name, props) => [props.payload.impact, 'Impact']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#f43f5e' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Increases Risk</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Decreases Risk</div>
      </div>
    </div>
  );
}
