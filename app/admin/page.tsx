'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Calendar, Clock, Shield, Search, Download, Eye, EyeOff, Lock, X, Filter
} from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized]);

  async function fetchData() {
    const { data } = await supabase
      .from('bookings')
      .select('*, halls(name)')
      .order('booking_date', { ascending: true }) 
      .order('start_time', { ascending: true });
    
    if (data) setBookings(data);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthorized(true);
    else alert("Incorrect admin password.");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this record permanently?")) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const filteredBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    const isPast = b.booking_date < today;
    const matchesSearch = 
      b.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.booking_date?.includes(searchTerm);

    if (!showPastEvents && isPast) return false;
    return matchesSearch;
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-center">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <Lock size={32} />
          </div>
          <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter mb-2">Admin Access</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-8">Secure Management Portal</p>
          <input 
            type="password" 
            placeholder="Enter Admin Password"
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-white mb-4 focus:border-emerald-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
            Authorize
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-4 md:p-12 font-sans print:bg-white">
      
      {/* HEADER & CONTROLS */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" size={28} />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
              Admin <span className="text-emerald-500">Control</span>
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Live Data Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* ENHANCED SEARCH */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-10 text-sm focus:border-emerald-500 outline-none transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* QUICK TODAY FILTER */}
          <button 
            onClick={() => setSearchTerm(new Date().toISOString().split('T')[0])}
            className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Filter size={14} /> Today
          </button>

          <button 
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
              showPastEvents ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showPastEvents ? <Eye size={16} /> : <EyeOff size={16} />} 
            {showPastEvents ? 'Hide History' : 'Show History'}
          </button>

          <button onClick={() => window.print()} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* COMPACT STATS (Simple text instead of cards) */}
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between px-6 print:hidden">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            Showing {filteredBookings.length} records
        </span>
      </div>

      {/* DATA TABLE */}
      <div className="max-w-7xl mx-auto bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-6">Event Details</th>
                <th className="p-6">Timing</th>
                <th className="p-6">Department</th>
                <th className="p-6">User Info</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredBookings.map((b) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isPast = b.booking_date < todayStr;
                const isToday = b.booking_date === todayStr;

                return (
                  <tr key={b.id} className={`transition-colors ${
                    isPast ? 'opacity-40 grayscale-[0.5]' : 
                    isToday ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : 
                    'hover:bg-white/[0.02]'
                  }`}>
                    <td className="p-6">
                      <p className="text-white font-bold uppercase italic text-sm">{b.event_name}</p>
                      <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tighter">{b.halls?.name}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                        <Calendar size={12} className="text-emerald-500/50"/> {b.booking_date}
                        {isToday && <span className="ml-2 text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black tracking-widest animate-pulse">TODAY</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase">
                        <Clock size={10}/> {b.start_time} - {b.end_time}
                      </div>
                    </td>
                    <td className="p-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            {b.department}
                        </span>
                    </td>
                    <td className="p-6">
                      <p className="text-white text-xs font-bold">{b.user_name}</p>
                      <p className="text-slate-500 text-[10px]">{b.user_email}</p>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all bg-slate-800/50 rounded-xl hover:bg-rose-500/10">
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}