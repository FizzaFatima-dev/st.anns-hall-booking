'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'react-hot-toast'; // New Notification Library
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Building2, Calendar as LucideCalendar, 
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Sparkles, Mail, MapPin, X, Info
} from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<any>(null);
  const [allHalls, setAllHalls] = useState<any[]>([]);
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
      const { data: allHallsData } = await supabase.from('halls').select('*');
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id);
      setHall(hallData);
      if (allHallsData) setAllHalls(allHallsData);
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName || !formData.dept) {
      toast.error("Please fill in all required fields.");
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
      toast.success("Verification code sent!");
      setIsVerifying(true);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return toast.error("Please enter the code.");
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'signup'
    });

    if (otpError) {
      setLoading(false);
      toast.error("Invalid Code.");
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

    setLoading(true);
    if (!bookingError) {
      toast.success("Booking successfully confirmed!");
      setIsSuccess(true);
    } else {
      toast.error("Database Error: " + bookingError.message);
    }
    setLoading(false);
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest">Loading...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">CONFIRMED</h2>
          <p className="text-slate-500 font-medium mb-10">Your event has been added to the official calendar.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all">Back to Hall</button>
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Sleek Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900 uppercase">ST. ANN'S</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {isRegistering && selectedDate ? (
           // REGISTRATION FORM 
           <div className="max-w-4xl mx-auto">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-bold text-[11px] uppercase tracking-widest transition-all">
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
             </button>
             <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="bg-slate-950 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-8 h-8" /></div>
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight uppercase italic">{hall.name}</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Departmental Registration</p>
                      </div>
                    </div>
                    <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4 text-sm font-bold shadow-inner">
                      <LucideCalendar className="w-5 h-5 text-emerald-400" />
                      <span className="uppercase tracking-widest italic">{format(selectedDate, 'EEEE, MMMM do')}</span>
                    </div>
                </div>
                <div className="p-12">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
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
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-10 py-6 bg-slate-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all">
                        {loading ? 'Processing...' : 'Send Verification Code'}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-10 py-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                          <ShieldCheck className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold uppercase text-slate-900 tracking-tight mb-2 italic">Verify Email</h3>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Enter the 6-digit code sent to {formData.email}</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-5xl font-extrabold tracking-[0.3em] border-b-4 border-emerald-500 outline-none text-slate-900" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all">Confirm Booking</button>
                    </div>
                   )}
                </div>
             </div>
           </div>
        ) : (
          // CALENDAR VIEW
          <>
            <div className="mb-12">
              <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-bold text-[11px] uppercase tracking-widest transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Halls
              </button>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase italic mb-4">{hall.name}</h1>
              <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Available
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> Booked
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden ring-1 ring-slate-100">
              <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50">
                <h2 className="text-2xl font-extrabold text-slate-900 uppercase italic tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-white text-slate-900 shadow-sm rounded-xl font-bold text-[11px] uppercase tracking-[0.2em]">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] py-6 text-center border-b border-slate-50">
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
                      className={`min-h-[140px] md:min-h-[160px] p-6 border-b border-r border-slate-50 transition-all group relative cursor-pointer
                        ${!isCurrentMonth || isPast ? 'bg-slate-50/20 opacity-30 cursor-not-allowed' : 'hover:bg-emerald-50/20'}
                        ${isToday ? 'bg-emerald-50/30' : ''}`}
                    >
                      <span className={`text-base font-extrabold w-10 h-10 flex items-center justify-center rounded-xl mb-4 transition-all
                        ${isToday ? 'bg-slate-950 text-white shadow-xl rotate-3' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm ring-2 ring-white" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ... (Keep footer and popup with same refined color logic) ... */}
    </div>
  );
}