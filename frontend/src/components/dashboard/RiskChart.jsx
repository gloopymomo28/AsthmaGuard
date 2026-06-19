import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function RiskChart({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const risk = payload[0].value;
      const isHighRisk = risk >= 70;
      const isWarning = risk >= 40 && risk < 70;
      
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className={`font-bold ${isHighRisk ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
            Risk Score: {risk}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-[400px]">
      <h3 className="font-semibold text-lg text-slate-100 mb-6">Risk Trajectory (Next 24h)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#0a0f1a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
