import { Heart, Wind, Activity, Gauge, PersonStanding, ClipboardList, Pill } from 'lucide-react';

export default function VitalsGrid({ vitals = {} }) {
  
  // Default values for new vitals if missing
  const pefValue = vitals.pef || 350;
  const pefPercent = vitals.pefPercent || 75; // mock baseline percentage
  const activityLevel = vitals.activityLevel || 'Moderate';
  const symptomScore = vitals.symptomScore !== undefined ? vitals.symptomScore : 2;
  const inhalerUsage = vitals.inhalerUsage !== undefined ? vitals.inhalerUsage : 1;

  let pefColor = 'text-emerald-500';
  let pefBg = 'bg-emerald-500/10';
  if (pefPercent < 50) {
    pefColor = 'text-rose-500';
    pefBg = 'bg-rose-500/10';
  } else if (pefPercent <= 80) {
    pefColor = 'text-amber-500';
    pefBg = 'bg-amber-500/10';
  }

  const stats = [
    { label: 'Heart Rate', value: `${vitals.hr || 75} bpm`, icon: Heart, status: (vitals.hr || 75) > 90 ? 'warning' : 'normal' },
    { label: 'SpO2', value: `${vitals.spo2 || 98}%`, icon: Activity, status: (vitals.spo2 || 98) < 95 ? 'warning' : 'normal' },
    { label: 'Resp. Rate', value: `${vitals.rr || 14} /min`, icon: Wind, status: (vitals.rr || 14) > 20 ? 'warning' : 'normal' },
    { 
      label: 'PEF', 
      value: `${pefValue} L/min`, 
      subValue: `(${pefPercent}%)`,
      icon: Gauge, 
      customColor: pefColor,
      customBg: pefBg
    },
    { label: 'Activity Level', value: activityLevel, icon: PersonStanding, status: 'normal' },
    { label: 'Symptom Score', value: `${symptomScore}/10`, icon: ClipboardList, status: symptomScore > 5 ? 'warning' : 'normal' },
    { label: 'Rescue Inhaler', value: `${inhalerUsage} puffs`, icon: Pill, status: inhalerUsage > 2 ? 'warning' : 'normal' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const isWarning = stat.status === 'warning';
        const colorClass = stat.customColor ? stat.customColor : (isWarning ? 'text-amber-500' : 'text-emerald-500');
        const valColorClass = stat.customColor ? stat.customColor : (isWarning ? 'text-amber-400' : 'text-slate-100');
        
        return (
          <div key={i} className={`bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between h-28 ${stat.customBg || ''}`}>
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              <Icon size={16} className={colorClass} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-semibold ${valColorClass}`}>
                {stat.value}
              </span>
              {stat.subValue && (
                <span className={`text-sm font-medium ${valColorClass} opacity-80`}>
                  {stat.subValue}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
