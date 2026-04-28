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
  ChevronLeft, ChevronRight, Building2, Calendar as LucideCalendar, 
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Sparkles, X, Plus, Info
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
    fullName: '', email: '', phone: '', dept: '',
    eventName: '', eventType: 'Seminar', startTime: '', endTime: ''
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
    if (!formData.email || !formData.fullName || !formData.dept) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
        toast.success("OTP sent to your email!");
        setIsVerifying(true);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return toast.error("Enter OTP code.");
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'email' // Changed to 'email' for better compatibility
    });

    if (otpError) {
      setLoading(false);
      toast.error("Invalid or expired code.");
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
      department: formData.dept,
      status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) setIsSuccess(true);
    else toast.error("Error: " + bookingError.message);
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest italic">Loading Portal...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Confirmed!</h2>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all">Back to Home</button>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-emerald-100">
      <Toaster position="top-center" />
      
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-5 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg"><Building2 className="w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tighter uppercase italic">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!isRegistering ? (
          <>
            <div className="mb-10">
              <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-bold text-[10px] uppercase tracking-widest transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Halls
              </button>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{hall.name}</h1>
                  {/* LEGEND RESTORED HERE */}
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Available
                    </div>
                    <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> Booked
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-16 ring-1 ring-slate-100">
              <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-white text-slate-900 shadow-sm rounded-xl font-bold text-[10px] uppercase tracking-[0.2em]">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] py-6 border-b border-slate-50 text-center">
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
                      className={`min-h-[140px] md:min-h-[170px] p-6 border-b border-r border-slate-50 transition-all group relative cursor-pointer
                        ${!isCurrentMonth || isPast ? 'bg-slate-50/20 opacity-20 cursor-not-allowed' : 'hover:bg-emerald-50/30'}
                        ${isToday ? 'bg-emerald-50/40' : ''}`}
                    >
                      <span className={`text-base font-black w-10 h-10 flex items-center justify-center rounded-xl mb-4 transition-all
                        ${isToday ? 'bg-slate-950 text-white shadow-xl scale-110' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm ring-2 ring-white" />
                        ))}
                      </div>

                      {isCurrentMonth && !isPast && (
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all bg-emerald-500 text-white p-1 rounded-lg shadow-lg scale-75 group-hover:scale-100">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INSTRUCTION BOX - RESTORED AND IMPROVED */}
            <div className="max-w-4xl mx-auto bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-24 h-24" /></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center"><Info className="w-5 h-5 text-white" /></div>
                    <h3 className="text-xl font-black uppercase italic tracking-widest">Booking Instructions</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <div className="flex gap-5">
                        <span className="text-3xl font-black text-emerald-500 italic">01</span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-400">Select Date</p>
                          <p className="text-xs font-medium text-slate-400 leading-relaxed">Click on any available date to view current timings and agendas.</p>
                        </div>
                      </div>
                      <div className="flex gap-5">
                        <span className="text-3xl font-black text-emerald-500 italic">02</span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-400">Event Details</p>
                          <p className="text-xs font-medium text-slate-400 leading-relaxed">Input your departmental details and specify your required time slot.</p>
                        </div>
                      </div>
                      <div className="flex gap-5">
                        <span className="text-3xl font-black text-emerald-500 italic">03</span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-400">Verification</p>
                          <p className="text-xs font-medium text-slate-400 leading-relaxed">Secure your slot instantly by verifying your official campus email.</p>
                        </div>
                      </div>
                  </div>
               </div>
            </div>
          </>
        ) : (
          /* REGISTRATION FORM (Only shows when isRegistering is true) */
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-bold text-[10px] uppercase tracking-widest transition-all">
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
             </button>
             <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="bg-slate-950 p-10 md:p-14 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><Building2 className="text-white w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase italic">{hall.name}</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Official Slot Registration</p>
                      </div>
                    </div>
                    <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 text-sm font-bold">
                      <LucideCalendar className="w-4 h-4 text-emerald-400" />
                      <span className="uppercase tracking-widest">{format(selectedDate!, 'EEEE, MMMM do')}</span>
                    </div>
                </div>
                <div className="p-10 md:p-16">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <input type="text" placeholder="FULL NAME *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase transition-all" />
                      <input type="email" placeholder="EMAIL ADDRESS *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base outline-none focus:border-emerald-500 transition-all" />
                      <input type="text" placeholder="DEPARTMENT *" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase transition-all" />
                      <input type="text" placeholder="EVENT NAME *" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase transition-all" />
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base w-full outline-none focus:border-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="border-b border-slate-200 py-4 font-bold text-base w-full outline-none focus:border-emerald-500" />
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-6 py-6 bg-slate-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all">
                        {loading ? 'Sending Code...' : 'Verify Identity & Book'}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-10 py-10">
                        <ShieldCheck className="w-14 h-14 text-emerald-600 mx-auto" />
                        <div>
                          <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tight">Verify Email</h3>
                          <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 tracking-widest">Sent to {formData.email}</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-5xl font-black tracking-[0.3em] border-b-4 border-emerald-500 outline-none text-slate-900" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Confirm Booking</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* DAILY AGENDA POPUP */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-950 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Daily Agenda</h3>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">{format(selectedDate, 'EEEE, MMMM do')}</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-10">
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-10 pr-2 custom-scrollbar">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
                      <div>
                        <p className="text-xs font-black text-slate-950 uppercase italic mb-1">{b.event_name}</p>
                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{b.department}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-black text-slate-900 tracking-tighter">{b.start_time} - {b.end_time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <LucideCalendar className="w-10 h-10 mx-auto mb-4 text-slate-200" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No events scheduled</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-4 h-4" /> Book New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}