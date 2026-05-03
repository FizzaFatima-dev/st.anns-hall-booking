'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Building2, Calendar as LucideCalendar, 
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Sparkles, X, Zap, Info
} from 'lucide-react';

// --- SKELETON LOADER FOR CALENDAR ---
const CalendarSkeleton = () => (
  <div className="w-full bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
    <div className="p-10 border-b border-slate-50 flex justify-between">
      <div className="h-8 bg-slate-200 w-48 rounded-lg" />
      <div className="h-10 bg-slate-100 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-7 gap-px bg-slate-50">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="min-h-[140px] bg-white p-4">
          <div className="w-8 h-8 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

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
    fullName: '', email: '', phone: '', dept: '',
    eventName: '', eventType: 'Seminar', startTime: '', endTime: ''
  });

  useEffect(() => {
    async function fetchData() {
      const { data: hallData } = await supabase.from('halls').select('*').eq('id', id).single();
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id);
      
      if (hallData) setHall(hallData);
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const triggerConfetti = () => {
    // Basic dynamic import for confetti to avoid installation issues
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => {
      (window as any).confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#ffffff']
      });
    };
    document.head.appendChild(script);
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName || !formData.dept) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) alert("Error sending code: " + error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return alert("Please enter the code.");
    setLoading(true);

    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'email' 
    });

    if (otpError) {
      setLoading(false);
      alert("Invalid Code: " + otpError.message);
      return;
    }

    const { error: bookingError } = await supabase.from('bookings').insert([{
      hall_id: id,
      event_name: formData.eventName,
      booking_date: format(selectedDate!, 'yyyy-MM-dd'),
      start_time: formData.startTime,
      end_time: formData.endTime,
      user_name: formData.fullName,
      user_email: formData.email,
      email: formData.email,
      department: formData.dept,
      status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) {
      setIsSuccess(true);
      triggerConfetti();
    } else {
      alert("Database Error: " + bookingError.message);
    }
  };

  if (!hall) return (
    <div className="min-h-screen bg-[#F8FAFC] p-12">
      <div className="max-w-7xl mx-auto"><CalendarSkeleton /></div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-emerald-600 p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-32 h-32" /></div>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Confirmed!</h2>
            <p className="text-emerald-100 font-bold uppercase text-[10px] tracking-[0.3em]">Booking Receipt Generated</p>
          </div>

          <div className="p-10 space-y-6">
            <div className="space-y-4 text-left">
              {[
                { label: 'Organizer', value: formData.fullName },
                { label: 'Venue', value: hall.name },
                { label: 'Date', value: selectedDate ? format(selectedDate, 'MMMM do, yyyy') : '' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-sm font-black text-slate-900 uppercase italic">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</span>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">{formData.startTime} - {formData.endTime}</span>
                </div>
              </div>
            </div>
            <button onClick={() => router.push('/')} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1">
              Return to Campus Portal
            </button>
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
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 py-6 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        {isRegistering && selectedDate ? (
           <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> Back to Calendar
             </button>
             
             <div className="bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20"><Building2 className="text-emerald-400 w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none mb-1">{hall.name}</h2>
                        <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em]">Official Registration</p>
                      </div>
                    </div>
                    <div className="bg-white/5 px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-4">
                      <LucideCalendar className="w-5 h-5 text-emerald-400" />
                      <span className="font-black uppercase text-sm tracking-tight">{format(selectedDate, 'EEEE, MMMM do')}</span>
                    </div>
                </div>

                <div className="p-12">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                      {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email Address', key: 'email', type: 'email' },
                        { label: 'Department', key: 'dept', type: 'text' },
                        { label: 'Event Name', key: 'eventName', type: 'text' },
                      ].map((field) => (
                        <div key={field.key} className="relative group">
                          <input 
                            type={field.type} 
                            required
                            placeholder=" "
                            value={(formData as any)[field.key]} 
                            onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                            className="peer w-full border-b-2 border-slate-200 py-4 font-bold text-lg outline-none focus:border-emerald-500 transition-colors uppercase bg-transparent"
                          />
                          <label className="absolute left-0 top-4 text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-4">
                            {field.label} *
                          </label>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border-b-2 border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border-b-2 border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500" />
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-8 py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Send Verification Code</>}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-10 py-10 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                          <ShieldCheck className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black uppercase italic text-slate-900 mb-2">Verify Identity</h3>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">A 6-digit code was sent to <span className="text-emerald-600">{formData.email}</span></p>
                        </div>
                        <input 
                          type="text" 
                          maxLength={6} 
                          placeholder="000000" 
                          autoFocus
                          value={otpCode} 
                          onChange={e => setOtpCode(e.target.value)} 
                          className="w-full text-center text-6xl font-black tracking-[0.3em] border-b-4 border-emerald-500 outline-none text-slate-900 pb-4 bg-transparent placeholder:text-slate-100" 
                        />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">
                            {loading ? 'Processing...' : 'Confirm & Generate Receipt'}
                        </button>
                        <button onClick={() => setIsVerifying(false)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors">Edit Email Address</button>
                    </div>
                   )}
                </div>
             </div>
           </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-12">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-black text-[10px] uppercase tracking-widest transition-all group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> Back to Halls
                </button>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none uppercase italic">{hall.name}</h1>
              </div>
              <div className="flex gap-4 mb-2">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Available</span></div>
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] font-black uppercase text-rose-700 tracking-widest">Booked</span></div>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-16 transition-all">
              <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-50">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase italic">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-emerald-600"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-white text-slate-900 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-emerald-600"><ChevronRight className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-[0.4em] py-6 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
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
                      className={`min-h-[160px] p-6 border-b border-r border-slate-50 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/30 cursor-not-allowed' : 'hover:bg-emerald-50/40 hover:shadow-inner'}`}
                    >
                      <span className={`text-xl font-black w-10 h-10 flex items-center justify-center rounded-2xl mb-4 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-xl scale-110' : 'text-slate-900 group-hover:text-emerald-600'}`}>{format(day, 'd')}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm border border-white"></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex items-start gap-4">
               <Info className="w-6 h-6 text-emerald-600 mt-1" />
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-900 mb-1">Booking Policy</h4>
                  <p className="text-emerald-700/70 text-xs font-bold leading-relaxed">Select an available date to view scheduled events or book a new slot. All bookings are subject to departmental approval. Please ensure your 6-digit OTP verification is completed to secure the venue.</p>
               </div>
            </div>
          </>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">Daily Agenda</h3>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">{format(selectedDate, 'EEEE, MMMM do')}</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-10">
              <div className="space-y-4 max-h-[350px] overflow-y-auto mb-10 pr-2 scrollbar-hide">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-rose-50 border border-rose-100 rounded-3xl hover:shadow-md transition-all">
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase italic mb-1">{b.event_name}</p>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-70">{b.department}</p>
                      </div>
                      <div className="flex items-center gap-2 text-rose-600 bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-black">{b.start_time} - {b.end_time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No events scheduled</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Sparkles className="w-5 h-5" /> Book New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}