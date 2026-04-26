'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Trash2, Calendar, Clock, BarChart3, Shield } from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data } = await supabase.from('bookings').select('*, halls(name)').order('booking_date', { ascending: false });
    if (data) {
      setBookings(data);
      setStats({ total: data.length });
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" size={28} />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Admin <span className="text-emerald-500">Control</span></h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">St. Ann's College Management System</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
          <BarChart3 className="text-emerald-500" />
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Bookings</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="p-6">Event / Hall</th>
              <th className="p-6">Schedule</th>
              <th className="p-6">Department</th>
              <th className="p-6">Organizer</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <p className="text-white font-bold uppercase italic text-sm">{b.event_name}</p>
                  <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tighter">{b.halls?.name}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold"><Calendar size={12}/> {b.booking_date}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase"><Clock size={10}/> {b.start_time} - {b.end_time}</div>
                </td>
                <td className="p-6">
                  <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-500/20">
                    {b.department || 'General'}
                  </span>
                </td>
                <td className="p-6">
                  <p className="text-white text-xs font-bold">{b.user_name}</p>
                  <p className="text-slate-500 text-[10px]">{b.user_email}</p>
                </td>
                <td className="p-6 text-right">
                  <button className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}