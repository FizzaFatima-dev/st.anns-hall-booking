// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Calendar, Clock, Shield, Search, Download, Lock, X, Filter
} from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHall, setFilterHall] = useState('All');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // Formats specific default names to matches the customized portal branding
  const formatHallName = (name: string): string => {
    if (!name) return '';
    if (name === "Seminar Hall 1") return "Gnanamma Hall";
    if (name === "Seminar Hall 2") return "Deickmann Hall";
    if (name.includes("Auditorium")) return "St. Joseph's Auditorium";
    return name;
  };

  // Human-readable 12hr time formatter matching the main page look
  const formatTo12Hr = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

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
    
    const formattedName = formatHallName(b.halls?.name || '');

    const matchesSearch = 
      b.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formattedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.booking_date?.includes(searchTerm);

    const matchesHall = filterHall === 'All' || formattedName === filterHall;

    if (!showPastEvents && isPast) return false;
    return matchesSearch && matchesHall;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterHall('All');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
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
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" size={28} />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
              Admin <span className="text-emerald-500">Control</span>
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Live Data Management</p>
        </div>

        {/* CONTROLS GROUP */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* SEARCH */}
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-10 text-sm focus:border-emerald-500 outline-none transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* VENUE PILL SELECTOR */}
          <div className="flex bg-slate-800/30 p-1 rounded-2xl border border-slate-700/50 overflow-x-auto no-scrollbar">
            {['All', "St. Joseph's Auditorium", 'Gnanamma Hall', 'Deickmann Hall'].map((hall) => (
              <button
                key={hall}
                onClick={() => setFilterHall(hall)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterHall === hall
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {hall === 'All' ? 'All' : hall.replace(' Hall', '')}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchTerm(new Date().toISOString().split('T')[0])}
              className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Filter size={14} /> Today
            </button>

            <button 
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                showPastEvents ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {showPastEvents ? 'History On' : 'History Off'}
            </button>

            <button onClick={() => window.print()} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* SUB-STATUS BAR */}
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between px-6 print:hidden">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                {filteredBookings.length} Records Found
            </span>
            {(searchTerm || filterHall !== 'All') && (
                <button 
                    onClick={resetFilters}
                    className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1 hover:underline"
                >
                    <X size={12} /> Clear Filters
                </button>
            )}
        </div>
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
                      <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tighter">{formatHallName(b.halls?.name || '')}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                        <Calendar size={12} className="text-emerald-500/50"/> {b.booking_date}
                        {isToday && <span className="ml-2 text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black tracking-widest animate-pulse">TODAY</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase">
                        <Clock size={10}/> {formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}
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
        {filteredBookings.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No records match your criteria</p>
                <button onClick={resetFilters} className="mt-4 text-emerald-500 font-bold text-xs hover:underline">Reset all filters</button>
            </div>
        )}
      </div>
    </div>
  );
}