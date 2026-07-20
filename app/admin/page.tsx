// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, XCircle, Clock, Calendar, 
  Trash2, ShieldCheck, Inbox, Search, Filter, Lock
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string | number;
  hall_id: string | number;
  event_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  user_name: string;
  user_email: string;
  department: string;
  status: string;
  halls?: { name: string };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const ADMIN_PASSWORD = "admin"; 

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminBookings();
    }
  }, [isAuthenticated]);

  async function fetchAdminBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, halls(name)')
      .order('booking_date', { ascending: false });
    
    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Invalid administrative passcode credential.");
    }
  };

  async function updateStatus(id: string | number, nextStatus: 'Confirmed' | 'Rejected') {
    const { error } = await supabase
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
      console.log(`Database updated successfully to ${nextStatus}. Automated Webhook will now fire the email.`);
    } else {
      console.error("Error updating status:", error);
    }
  }

  async function deleteBooking(id: string | number) {
    if (!confirm("Are you sure you want to permanently delete this reservation record?")) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  }

  const formatTo12Hr = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.halls?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-slate-400 font-medium">Elevated authorization access gateway required</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide">Security Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                autoFocus
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-medium text-rose-600">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm tracking-wide transition-all shadow-md active:scale-[0.99]"
            >
              Verify & Unlock Control Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans font-medium tracking-wider text-slate-500 animate-pulse">
        Loading Administrative Ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Control Panel</h1>
              <p className="text-xs text-slate-500 font-medium">Manage and audit institutional venue schedules</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search event, host, or department..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 font-medium outline-none focus:border-emerald-500 transition-all shadow-sm"
            >
              <option value="All">All Reservations</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Event & Venue</th>
                  <th className="py-4 px-6">Host / Department</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Schedule Window</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{b.event_name}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{b.halls?.name || 'Unknown Venue'}</p>
                    </td>
                    
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-800">{b.user_name}</p>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">{b.department}</p>
                    </td>

                    <td className="py-4 px-6 font-medium whitespace-nowrap text-slate-600">
                      {format(new Date(b.booking_date), 'MMM dd, yyyy')}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-600">
                      {formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        b.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {b.status === 'Confirmed' && <CheckCircle size={12} />}
                        {b.status === 'Rejected' && <XCircle size={12} />}
                        {(!b.status || b.status === 'Pending') && <Clock size={12} />}
                        {b.status || 'Pending'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {b.status !== 'Confirmed' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Confirmed')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all"
                            title="Approve Booking"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {b.status !== 'Rejected' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Rejected')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-all"
                            title="Reject Booking"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button 
                          onClick={() => deleteBooking(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium">No matching reservations found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}