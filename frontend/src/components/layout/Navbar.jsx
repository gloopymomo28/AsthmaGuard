import { Bell, Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { patientService } from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <header className="h-20 bg-primary/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-slate-200">
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="bg-slate-900/50 border border-slate-700 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 w-64 transition-all"
          />
          
          {isOpen && query.length > 0 && (
            <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      navigate(`/patient/${p.id}`);
                    }}
                    className="px-4 py-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                  >
                    <div className="font-medium text-slate-200">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.age}y • {p.sex} • {p.severity || p.asthma_severity}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400">No patients found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
