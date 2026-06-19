import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function VitalsChart({ title, data, dataKey, strokeColor, domain, referenceLines = [] }) {
  // Generate mock 30-day timeline data based on current value if no historical data exists
  const mockHistoricalData = data || Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: (Math.random() * (domain[1] - domain[0]) * 0.2) + (domain[1] + domain[0]) / 2
  }));

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 h-64">
      <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockHistoricalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: strokeColor }}
            />
            {referenceLines.map((line, idx) => (
              <ReferenceLine key={idx} y={line.y} stroke={line.color} strokeDasharray="3 3" />
            ))}
            <Line 
              type="monotone" 
              dataKey={dataKey || 'value'} 
              stroke={strokeColor} 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: strokeColor, stroke: '#1e293b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
