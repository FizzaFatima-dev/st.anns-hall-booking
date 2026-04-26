'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building2, Users, Trash2, Calendar, Clock, 
  BarChart3, Shield, Search, Download, Printer 
} from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data } = await supabase.from('bookings').select('*, halls(name)').order('booking_date', { ascending: false });
    if (data) {
      setBookings(data);
      setStats({ total: data.length });
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this record permanently?")) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  // --- FEATURE 3: LIVE SEARCH LOGIC ---
  const filteredBookings = bookings.filter(b => 
    b.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.halls?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- FEATURE 2: EXPORT TO PDF ---
  const handleExport = () => {
    window.print(); // This opens the browser print dialog optimized by the CSS below
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-8 md:p-12 font-sans print:bg-white print:p-0">
      {/* Header - Hidden during print */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" size={28} />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Admin <span className="text-emerald-500">Control</span></h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">St. Ann's College Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* SEARCH BAR */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search events, halls..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-emerald-500 outline-none transition-all text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="max-w-7xl mx-auto bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl print:border-none print:shadow-none print:bg-white">
        {/* Printable Header */}
        <div className="hidden print:block p-8 border-b border-slate-100 mb-4">
            <h1 className="text-2xl font-bold text-black">St. Ann's Hall Booking Report</h1>
            <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">
              <th className="p-6">Event / Hall</th>
              <th className="p-6">Schedule</th>
              <th className="p-6">Department</th>
              <th className="p-6">Organizer</th>
              <th className="p-6 text-right print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 print:divide-slate-200">
            {filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors print:text-black">
                <td className="p-6">
                  <p className="text-white font-bold uppercase italic text-sm print:text-black">{b.event_name}</p>
                  <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tighter">{b.halls?.name}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold print:text-black">
                    <Calendar size={12} className="text-emerald-500/50 print:hidden"/> {b.booking_date}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase">
                    <Clock size={10}/> {b.start_time} - {b.end_time}
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-500/20 print:border-slate-200 print:text-black">
                    {b.department}
                  </span>
                </td>
                <td className="p-6">
                  <p className="text-white text-xs font-bold print:text-black">{b.user_name}</p>
                  <p className="text-slate-500 text-[10px]">{b.user_email}</p>
                </td>
                <td className="p-6 text-right print:hidden">
                  <button onClick={() => handleDelete(b.id)} className="text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]">No matches found</div>
        )}
      </div>

      {/* Stats Card - Hidden during print */}
      <div className="max-w-7xl mx-auto mt-8 flex justify-end print:hidden">
         <div className="bg-slate-800/30 border border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-4">
            <BarChart3 className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Showing {filteredBookings.length} results</span>
         </div>
      </div>
    </div>
  );
}