'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Building2, CheckCircle2, Clock, 
  ArrowLeft, X, Plus, Calendar as CalendarIcon, MapPin, Sparkles
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', dept: '', eventName: '', startTime: '', endTime: ''
  });

  const formatTo12Hr = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    async function fetchData() {
      const { data: hallData } = await supabase.from('halls').select('*').eq('id', id).single();
      if (hallData) setHall(hallData);

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('hall_id', id)
        .order('start_time', { ascending: true });
      
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName || !formData.dept) return alert("Please fill all fields.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email.toLowerCase(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email.toLowerCase(), token: otpCode, type: 'email' 
    });
    if (otpError) { setLoading(false); alert("Invalid Code"); return; }

    const { error: bookingError } = await supabase.from('bookings').insert([{
      hall_id: id, event_name: formData.eventName, booking_date: format(selectedDate!, 'yyyy-MM-dd'),
      start_time: formData.startTime, end_time: formData.endTime, user_name: formData.fullName,
      user_email: formData.email.toLowerCase(), email: formData.email.toLowerCase(), department: formData.dept, status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) {
        setIsSuccess(true);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.onload = () => (window as any).confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        document.head.appendChild(script);
    }
  };

  if (!hall) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Loading Hall...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-emerald-600 p-12 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-3xl font-light uppercase italic tracking-widest">Confirmed!</h2>
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Slot Reserved Successfully</p>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-4">
                <div className="text-center mb-6">
                   <h3 className="text-xl font-black uppercase italic text-slate-900">{formData.eventName}</h3>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1">{formData.dept}</p>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-4xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600"><Building2 className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p><p className="text-sm font-bold text-slate-900 uppercase italic">{hall.name}</p></div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-4xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600"><CalendarIcon className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="text-sm font-bold text-slate-900 uppercase italic">{format(selectedDate!, 'MMMM do, yyyy')}</p></div>
                </div>
            </div>
            <button onClick={() => router.push('/')} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl">Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">St. Ann's</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
           <Sparkles className="w-3 h-3" /> Booking Portal
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-[0.4em] transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Halls
                </button>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900 uppercase italic leading-none">{hall.name}</h1>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Available</span></div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"><div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Reserved</span></div>
              </div>
            </div>

            <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-20">
              <div className="p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-50 bg-slate-50/20">
                <h2 className="text-3xl font-light text-slate-900 uppercase italic tracking-tighter">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-[1.8rem] border border-slate-200 shadow-sm">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-l border-t border-slate-50">
                {calendarDays.map((day, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-40 p-6 border-b border-r border-slate-50 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/10 cursor-not-allowed' : 'hover:bg-emerald-50/30'}`}
                    >
                      {isCurrentMonth && !isPast && (
                        <div className="absolute top-6 right-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all group-hover:rotate-90">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                      
                      <span className={`text-xl font-black w-10 h-10 flex items-center justify-center rounded-2xl mb-6 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200 rotate-3' : 'text-slate-900 group-hover:text-emerald-600 group-hover:scale-110'}`}>{format(day, 'd')}</span>
                      
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                <span className="text-[9px] font-black uppercase text-rose-600 tracking-tighter">{dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}</span>
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="max-w-xl mx-auto text-center">
              <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 mb-8 italic">Quick Guide</h4>
                <ul className="space-y-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] inline-block text-left">
                  <li className="flex items-center gap-5 group-hover:translate-x-2 transition-transform"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Select an available date</li>
                  <li className="flex items-center gap-5 group-hover:translate-x-2 transition-transform delay-75"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Verify via Email OTP</li>
                  <li className="flex items-center gap-5 group-hover:translate-x-2 transition-transform delay-150"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Receive Instant Confirmation</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-3 text-slate-400 hover:text-emerald-600 mb-10 font-black text-[10px] uppercase tracking-[0.4em] transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Return to Calendar
             </button>
             <div className="bg-white rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-12 md:p-16 text-white relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
                  <h2 className="text-4xl font-light tracking-tight uppercase italic mb-2">{hall.name}</h2>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Request for {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</p>
                </div>
                <div className="p-12 md:p-20">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                      <div className="relative group border-b border-slate-100 focus-within:border-emerald-500 transition-colors pb-2">
                        <input type="text" placeholder=" " value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="peer w-full py-2 font-bold text-xl outline-none uppercase bg-transparent placeholder-transparent" />
                        <label className="absolute left-0 top-2 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-6 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-6">Host Full Name</label>
                      </div>
                      <div className="relative group border-b border-slate-100 focus-within:border-emerald-500 transition-colors pb-2">
                        <input type="email" placeholder=" " value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="peer w-full py-2 font-bold text-xl outline-none bg-transparent placeholder-transparent" />
                        <label className="absolute left-0 top-2 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-6 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-6">Academic Email</label>
                      </div>
                      <div className="relative group border-b border-slate-100 focus-within:border-emerald-500 transition-colors pb-2">
                        <input type="text" placeholder=" " value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="peer w-full py-2 font-bold text-xl outline-none uppercase bg-transparent placeholder-transparent" />
                        <label className="absolute left-0 top-2 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-6 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-6">Department</label>
                      </div>
                      <div className="relative group border-b border-slate-100 focus-within:border-emerald-500 transition-colors pb-2">
                        <input type="text" placeholder=" " value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="peer w-full py-2 font-bold text-xl outline-none uppercase bg-transparent placeholder-transparent" />
                        <label className="absolute left-0 top-2 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-6 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-6">Event Title</label>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-10 py-6 bg-slate-900 text-white rounded-4xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">{loading ? 'Processing Identity...' : 'Generate Verification OTP'}</button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-12 py-12">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-4">Enter 6-Digit Verification Code</p>
                          <input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-6xl font-light tracking-[0.5em] border-b-2 border-emerald-500 outline-none text-slate-900 pb-6 bg-transparent" />
                        </div>
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95">Complete Reservation</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-[60px] rounded-full" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">Daily Agenda</p>
                <h3 className="text-2xl font-light tracking-tighter uppercase italic">{format(selectedDate, 'MMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-10">
              <div className="space-y-4 mb-10 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div><p className="text-sm font-black text-slate-900 uppercase italic mb-1">{b.event_name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.department}</p></div>
                      <div className="text-[10px] font-black text-emerald-600 bg-white px-3 py-2 rounded-xl border border-slate-100">{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-4xl"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Reservations Scheduled</p></div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><Plus className="w-5 h-5" /> Request Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}