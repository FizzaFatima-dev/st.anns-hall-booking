'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Trash2, Calendar, CheckCircle, BarChart3 , Clock } from 'lucide-react';

export default function AdminPortal() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, halls: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*, halls(name)')
      .order('booking_date', { ascending: false });
    
    const { count: hallCount } = await supabase.from('halls').select('*', { count: 'exact', head: true });

    if (bookingData) {
      setBookings(bookingData);
      setStats({
        total: bookingData.length,
        pending: bookingData.filter(b => b.status === 'Pending').length,
        halls: hallCount || 0
      });
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Admin <span className="text-emerald-600">Portal</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">St. Ann's College Management</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><BarChart3 size={20}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Total Bookings</p><p className="text-xl font-black">{stats.total}</p></div>
            </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Event & Hall</th>
              <th className="p-6">Date & Time</th>
              <th className="p-6">Organized By</th>
               <th className="p-6">Department</th>
              <th className="p-6 text-right">Actions</th>
             
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-black text-slate-900 uppercase italic text-sm">{booking.event_name}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{booking.halls?.name}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                    <Calendar size={14} className="text-slate-400" /> {booking.booking_date}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] mt-1">
                    <Clock size={12} /> {booking.start_time} - {booking.end_time}
                  </div>
                </td>
                <td className="p-6">
                  <p className="font-bold text-slate-900 text-xs">{booking.user_name}</p>
                  <p className="text-slate-400 text-[10px]">{booking.user_email}</p>
                </td>
                <td className="p-6">
                  <p className="font-bold text-slate-900 text-xs">{booking.department}</p>
                </td>
                <td className="p-6 text-right">
                    
                  <button 
                    onClick={() => handleDelete(booking.id)}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No bookings found in the database.</div>
        )}
      </div>
    </div>
  );
}