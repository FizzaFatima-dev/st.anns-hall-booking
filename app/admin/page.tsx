// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Calendar, Clock, Shield, Search, Download, Lock, X, Filter, LayoutGrid, User, Layers, Inbox
} from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHall, setFilterHall] = useState('All');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const formatHallName = (name: string): string => {
    if (!name) return '';
    if (name === "Seminar Hall 1") return "Gnanamma Hall";
    if (name === "Seminar Hall 2") return "Deickmann Hall";
    if (name.includes("Auditorium")) return "St. Joseph's Auditorium";
    return name;
  };

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
      .order('booking_date', { ascending: false }) 
      .order('start_time', { ascending: true });
    
    if (data) setBookings(data);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthorized(true);
    else alert("Incorrect control gate token password validation verification.");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently drop and wipe this scheduling index reference row?")) {
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
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
          <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-500 border border-emerald-500/20">
            <Lock size={24} />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight mb-1">Administrative Gateway</h2>
          <p className="text-slate-500 text-xs font-medium mb-6">Enter secure access token</p>
          <input 
            type="password" 
            placeholder="System Passcode"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white mb-4 focus:border-emerald-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-all shadow-lg">
            Authorize Node Access
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-4 md:p-10 font-sans print:bg-white">
      
      {/* ACTION HUB TOP BAR */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Shield className="text-emerald-500" size={24} />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Control Panel
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-xs">Live Database Operations Console</p>
        </div>

        {/* INPUT LAYOUT BAR ACCENTS */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input 
              type="text" 
              placeholder="Search bookings indexes..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-9 text-xs focus:border-emerald-500 outline-none transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {['All', "St. Joseph's Auditorium", 'Gnanamma Hall', 'Deickmann Hall'].map((hall) => (
              <button
                key={hall}
                onClick={() => setFilterHall(hall)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterHall === hall
                    ? 'bg-slate-800 text-white border border-slate-700/50 shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {hall === 'All' ? 'All' : hall.replace(' Hall', '')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchTerm(new Date().toISOString().split('T')[0])}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Filter size={13} /> Today
            </button>

            <button 
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all border ${
                showPastEvents ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {showPastEvents ? 'Showing Past logs' : 'Hiding Past'}
            </button>

            <button onClick={() => window.print()} className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white transition-all">
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between px-2 print:hidden">
        <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
                {filteredBookings.length} Active Query Matches
            </span>
            {(searchTerm || filterHall !== 'All') && (
                <button 
                    onClick={resetFilters}
                    className="text-xs font-medium text-rose-400 flex items-center gap-0.5 hover:underline"
                >
                    <X size={12} /> Reset System State
                </button>
            )}
        </div>
      </div>

      {/* DYNAMIC COMPACT MATRIX GRID CARD SYSTEM REPLACE STANDARD BLANK ROWS */}
      <div className="max-w-7xl mx-auto">
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((b) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isPast = b.booking_date < todayStr;
              const isToday = b.booking_date === todayStr;

              return (
                <div key={b.id} className={`bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all relative group ${
                  isPast ? 'opacity-40 border-slate-900' : 
                  isToday ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/[0.02]' : 
                  'border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">{b.event_name}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{formatHallName(b.halls?.name || '')}</p>
                      </div>
                      {isToday && <span className="text-[9px] bg-emerald-600 text-white font-extrabold tracking-wider px-2 py-0.5 rounded-md shadow animate-pulse">TODAY</span>}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Calendar size={13} className="text-slate-600" />
                        <span>{b.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Clock size={13} className="text-slate-600" />
                        <span>{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-center shrink-0"><User size={13} className="text-slate-400" /></div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-300 truncate leading-none">{b.user_name}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{b.user_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                        {b.department.substring(0,6)}
                      </span>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors bg-slate-950 border border-slate-800 rounded-lg">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
              <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium tracking-wide">No scheduling records found corresponding to filters</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-400 text-xs font-semibold hover:underline">Reset layout variables</button>
          </div>
        )}
      </div>
    </div>
  );
}