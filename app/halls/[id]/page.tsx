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
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Sparkles, X, Plus, Info, Zap
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
      type: 'email'
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

  if (!hall) return <div className="h-screen bg-[#020617] flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest italic">Loading Portal...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Booking Confirmed</h2>
          <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">Check your email for digital confirmation.</p>
          <button onClick={() => router.push('/')} className="w-full py-5 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-400 transition-all active:scale-95">Back to Home Portal</button>
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
    <div className="min-h-screen bg-[#020617] font-sans text-slate-200">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-6 md:px-10 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Building2 className="text-slate-950 w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">St. Ann's</span>
        </div>
        <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50 italic">Secure Resource Booking</div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {!isRegistering ? (
          <>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-6 font-bold text-[11px] uppercase tracking-widest transition-all group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Browse All Halls
                </button>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{hall.name}</h1>
                <div className="flex items-center gap-6 mt-8">
                  <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" /> Available Slots
                  </div>
                  <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600/50" /> Reserved
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden mb-16 shadow-2xl">
              <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-4">
                  <LucideCalendar className="text-emerald-500 w-6 h-6" />
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-white/5 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] py-5 border-b border-white/5 text-center">
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
                      className={`min-h-[140px] md:min-h-[160px] p-6 border-b border-r border-white/5 transition-all group relative cursor-pointer
                        ${!isCurrentMonth || isPast ? 'bg-slate-950/40 opacity-20 cursor-not-allowed' : 'hover:bg-emerald-500/5'}
                        ${isToday ? 'bg-emerald-500/10' : ''}`}
                    >
                      <span className={`text-base font-black w-10 h-10 flex items-center justify-center rounded-xl mb-4 transition-all
                        ${isToday ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : isCurrentMonth ? 'text-white' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                        ))}
                      </div>

                      {isCurrentMonth && !isPast && (
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all bg-emerald-500 text-slate-950 p-1 rounded-lg scale-75 group-hover:scale-100">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { step: '01', title: 'Pick a Date', desc: 'Identify an open slot in the calendar marked by the green indicator.', icon: LucideCalendar },
                 { step: '02', title: 'Input Data', desc: 'Provide event specifics and your departmental identification for the record.', icon: Sparkles },
                 { step: '03', title: 'Verify OTP', desc: 'Authorize the booking through your official campus email verification code.', icon: ShieldCheck },
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-slate-900/30 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl font-black text-emerald-500/20 italic group-hover:text-emerald-500 transition-colors">{item.step}</span>
                      <item.icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 italic">{item.title}</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </>
        ) : (
          /* REGISTRATION FORM */
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-8 font-bold text-[11px] uppercase tracking-widest transition-all">
                <ArrowLeft className="w-4 h-4" /> Return to Calendar
             </button>
             <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="bg-emerald-500 p-10 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl"><Building2 className="text-emerald-500 w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase italic tracking-tight">{hall.name}</h2>
                        <p className="text-emerald-950/60 text-[10px] font-black uppercase tracking-[0.2em]">Form 24-B / Official Slot Registration</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 text-sm font-bold text-slate-950">
                      <LucideCalendar className="w-4 h-4" />
                      <span className="uppercase tracking-widest">{format(selectedDate!, 'EEEE, MMMM do')}</span>
                    </div>
                </div>
                <div className="p-10 md:p-16">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                      {[
                        { label: 'FULL NAME *', key: 'fullName' },
                        { label: 'EMAIL ADDRESS *', key: 'email', type: 'email' },
                        { label: 'DEPARTMENT *', key: 'dept' },
                        { label: 'EVENT NAME *', key: 'eventName' }
                      ].map((field) => (
                        <div key={field.key} className="relative group">
                          <input 
                            type={field.type || 'text'} 
                            placeholder={field.label}
                            value={formData[field.key as keyof typeof formData]} 
                            onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                            className="w-full bg-transparent border-b border-slate-800 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase transition-all placeholder:text-slate-700 text-white" 
                          />
                          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-emerald-500 group-focus-within:w-full transition-all duration-500" />
                        </div>
                      ))}
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl font-bold text-white outline-none focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl font-bold text-white outline-none focus:border-emerald-500 transition-all" />
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-10 py-6 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-400 transition-all active:scale-[0.98]">
                        {loading ? 'Processing System...' : 'Request Verification Code'}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-12 py-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                          <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black uppercase italic text-white tracking-tight">Security Check</h3>
                          <p className="text-slate-500 text-[10px] font-bold uppercase mt-3 tracking-[0.2em]">Verification code dispatched to {formData.email}</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-transparent text-center text-6xl font-black tracking-[0.4em] border-b-2 border-emerald-500/30 focus:border-emerald-500 outline-none text-white transition-all" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-400 transition-all">Confirm Formal Booking</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* DAILY AGENDA MODAL */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-950 p-8 text-white flex justify-between items-center border-b border-white/5">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Day Overview</h3>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">{format(selectedDate, 'EEEE, MMMM do')}</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-10">
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-10 pr-2">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald-500/20 transition-all">
                      <div>
                        <p className="text-[11px] font-black text-white uppercase italic mb-1">{b.event_name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{b.department}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-white tracking-tighter">{b.start_time} - {b.end_time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-slate-800" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No Reserved Slots</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }}
                className="w-full py-5 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Reserve New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}