import { NavLink } from 'react-router-dom';
import { Home, Users, Activity, Settings, UserPlus } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/patient/new', icon: UserPlus, label: 'Add Patient' },
    { to: '/alerts', icon: Activity, label: 'Alerts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-secondary/50 backdrop-blur-md border-r border-slate-800 hidden md:flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <Activity className="text-emerald-400" />
          AsthmaGuard AI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={20} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
            DR
          </div>
          <div>
            <p className="text-sm font-medium">Dr. Reynolds</p>
            <p className="text-xs text-slate-400">Pulmonology</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
