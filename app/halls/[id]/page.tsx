'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'react-hot-toast'; 
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Building2, Clock, ArrowLeft, 
  ShieldCheck, Plus, X, Sparkles, CalendarDays
} from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', eventName: '', startTime: '', endTime: '', dept: ''
  });

  useEffect(() => {
    async function fetchData() {
      const { data: hallData } = await supabase.from('halls').select('*').eq('id', id).single();
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id);
      setHall(hallData);
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName) return toast.error("Fill in all fields.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: formData.email });
    setLoading(false);
    if (error) toast.error(error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'email'
    });

    if (otpError) {
      setLoading(false);
      return toast.error("Invalid code.");
    }

    const { error: bookingError } = await supabase.from('bookings').insert([{
      hall_id: id,
      event_name: formData.eventName,
      booking_date: format(selectedDate!, 'yyyy-MM-dd'),
      start_time: formData.startTime,
      end_time: formData.endTime,
      user_name: formData.fullName,
      user_email: formData.email,
      status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) router.refresh();
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-bold text-emerald-600 animate-pulse uppercase tracking-[0.3em]">Initialising...</div>;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      <Toaster position="top-center" />
      
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight uppercase italic text-slate-950">St. Ann's</span>
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-all">Exit</button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12">
        {!isRegistering ? (
          <div className="space-y-12">
            {/* 1. LEFT-ALIGNED HEADING */}
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-[0.9] mb-6">{hall.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Live Status: Free</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reserved Slots</span>
                </div>
              </div>
            </div>

            {/* 2. CENTERED FULL-WIDTH CALENDAR */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
              <div className="p-8 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-xl font-black uppercase italic tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center py-4 bg-white">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-[100px] md:min-h-[130px] p-4 border-b border-r border-slate-50 transition-all relative group
                        ${!isCurrentMonth || isPast ? 'bg-slate-50/40 opacity-20 cursor-not-allowed' : 'hover:bg-emerald-50/40 cursor-pointer'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[12px] font-black w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                        {isCurrentMonth && !isPast && (
                          <div className="opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-600 rounded-md shadow-lg shadow-emerald-200 transform translate-y-1 group-hover:translate-y-0 transition-all">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-4">{dayBookings.map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. CENTERED INSTRUCTION BOX UNDERNEATH */}
            <div className="max-w-2xl mx-auto bg-white border-2 border-emerald-500/20 rounded-[2.5rem] p-10 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">Booking Guide</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black mx-auto">1</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Select a date & time slot</p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black mx-auto">2</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Enter event details</p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black mx-auto">3</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Book your slot</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM UI */
          <div className="max-w-2xl mx-auto">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 mb-8 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Schedule
             </button>
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="bg-slate-950 p-10 text-white flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black uppercase italic leading-none mb-1">{hall.name}</h2>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Reservation Request</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Date</p>
                      <p className="font-black uppercase italic text-sm">{format(selectedDate!, 'MMM do, yyyy')}</p>
                    </div>
                </div>
                <div className="p-10 md:p-14 space-y-8">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 gap-8">
                        <input type="text" placeholder="FULL NAME" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 uppercase text-sm" />
                        <input type="email" placeholder="CAMPUS EMAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 text-sm" />
                        <input type="text" placeholder="EVENT AGENDA" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 uppercase text-sm" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold" />
                          <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold" />
                        </div>
                        <button onClick={handleSendOTP} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 mt-4">{loading ? 'Sending...' : 'Verify Email'}</button>
                    </div>
                   ) : (
                    <div className="text-center space-y-8 py-6">
                        <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto" />
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-transparent text-center text-6xl font-black tracking-[0.2em] border-b-4 border-emerald-600 outline-none text-slate-950 transition-all" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Complete Booking</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* MODAL VIEW */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black uppercase italic tracking-tight">{format(selectedDate, 'MMMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="p-8 text-center">
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">Secure This Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}