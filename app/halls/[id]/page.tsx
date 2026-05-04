'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Building2, CheckCircle2, 
  ArrowLeft, X, Plus, AlertCircle, MapPin, Clock, Calendar
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      
      if (hallData) {
        let finalName = hallData.name;
        if (hallData.name === "Seminar Hall 1") finalName = "Gnanamma Hall";
        else if (hallData.name === "Seminar Hall 2") finalName = "Deickmann Hall";
        else if (hallData.name.includes("Auditorium")) finalName = "St. Joseph's Auditorium";
        
        setHall({ ...hallData, name: finalName });
      }

      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id).order('start_time', { ascending: true });
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    setErrorMsg(null);
    if (!formData.email || !formData.fullName || !formData.dept || !formData.startTime || !formData.endTime) {
      setErrorMsg("Missing Information: Please fill all fields.");
      return;
    }
    const minTime = "07:30";
    const maxTime = "16:30";
    if (formData.startTime < minTime || formData.startTime > maxTime || formData.endTime < minTime || formData.endTime > maxTime) {
      setErrorMsg("Time Error: Operational hours are 07:30 AM - 04:30 PM.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setErrorMsg("Time Error: End time must be after start time.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email.toLowerCase(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email.toLowerCase(), token: otpCode, type: 'email' 
    });
    if (otpError) { setLoading(false); setErrorMsg("Invalid Code. Try again."); return; }

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

  if (!hall) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Loading...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-emerald-600 p-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3"><CheckCircle2 className="w-8 h-8" /></div>
            <h2 className="text-2xl font-black uppercase italic tracking-widest">Booking Receipt</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 mt-1">Transaction Successful</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Event Name</p>
                    <p className="text-lg font-black text-slate-900 uppercase italic leading-tight">{formData.eventName}</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                    <p className="text-[11px] font-bold text-slate-900">{selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Clock className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Time Slot</p>
                    <p className="text-[11px] font-bold text-slate-900">{formatTo12Hr(formData.startTime)} - {formatTo12Hr(formData.endTime)}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><MapPin className="text-emerald-600 w-5 h-5" /></div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Venue</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase italic">{hall.name}</p>
                  </div>
               </div>
            </div>
            <div className="pt-4">
              <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">Return to Portal</button>
            </div>
          </div>
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">St. Ann's Hall Booking System</p>
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
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-40 flex justify-between items-center md:bg-white/80 md:backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-24">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="w-full md:w-auto">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-[0.4em] transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Halls
                </button>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900 uppercase italic leading-none">{hall.name}</h1>
              </div>
              <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm shrink-0"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Available</span></div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm shrink-0"><div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Reserved</span></div>
              </div>
            </div>

            <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-20">
              <div className="p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-50 bg-slate-50/20">
                <h2 className="text-3xl font-light text-slate-900 uppercase italic tracking-tighter">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-[1.8rem] border border-slate-200 shadow-sm w-full md:w-auto justify-center">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em]">Today</button>
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
                      className={`min-h-20 md:min-h-40 p-2 md:p-6 border-b border-r border-slate-50 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/10 cursor-not-allowed' : 'hover:bg-emerald-50/30'}`}
                    >
                      <span className={`text-sm md:text-xl font-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl mb-2 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-xl rotate-3' : 'text-slate-900 group-hover:text-emerald-600'}`}>{format(day, 'd')}</span>
                      {dayBookings.length > 0 && isCurrentMonth && <div className="mt-auto hidden md:block"><div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /><span className="text-[9px] font-black uppercase text-rose-600 tracking-tighter">{dayBookings.length} Events</span></div></div>}
                      {dayBookings.length > 0 && isCurrentMonth && <div className="md:hidden w-1.5 h-1.5 rounded-full bg-rose-400 mx-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); setErrorMsg(null); }} className="flex items-center gap-3 text-slate-400 hover:text-emerald-600 mb-10 font-black text-[10px] uppercase tracking-[0.4em] transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Return to Calendar
             </button>
             <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 md:p-16 text-white relative">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight uppercase italic mb-2">{hall.name}</h2>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Request for {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</p>
                </div>
                <div className="p-8 md:p-20">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                      <div className="relative border-b-2 border-slate-600 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-black text-[9px] uppercase tracking-widest">Host Full Name</label>
                      </div>
                      <div className="relative border-b-2 border-slate-600 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="w-full py-2 font-bold text-xl outline-none bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-black text-[9px] uppercase tracking-widest">Academic Email</label>
                      </div>
                      <div className="relative border-b-2 border-slate-600 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Department" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-black text-[9px] uppercase tracking-widest">Department</label>
                      </div>
                      <div className="relative border-b-2 border-slate-600 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Event Name" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-black text-[9px] uppercase tracking-widest">Event Title</label>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" min="07:30" max="16:30" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg outline-none border-2 border-slate-600 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" min="07:30" max="16:30" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg outline-none border-2 border-slate-600 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="col-span-full mt-10 space-y-6">
                        {errorMsg && (
                          <div className="p-5 bg-rose-50 border border-rose-200 rounded-4xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200"><AlertCircle className="text-white w-5 h-5" /></div>
                            <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{errorMsg}</p>
                          </div>
                        )}
                        <button onClick={handleSendOTP} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 hover:bg-emerald-600 transition-all">
                          {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                      </div>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-12 py-8">
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-4">Enter Code</p><input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-4xl font-light tracking-[0.5em] border-b-2 border-emerald-500 outline-none text-slate-900 pb-6 bg-transparent" /></div>
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Verify & Complete</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white relative">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">Daily Agenda</p>
                <h3 className="text-2xl font-light tracking-tighter uppercase italic">{format(selectedDate, 'MMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div><p className="text-sm font-black text-slate-900 uppercase italic mb-1">{b.event_name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.department}</p></div>
                      <div className="text-[9px] font-black text-emerald-600 bg-white px-3 py-2 rounded-xl border border-slate-100 whitespace-nowrap">{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Reservations</p></div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3"><Plus className="w-5 h-5" /> Request Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}