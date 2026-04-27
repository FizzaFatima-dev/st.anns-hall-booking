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
  CheckCircle2, Clock, ArrowLeft, User, ShieldCheck
} from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRegistering, setIsRegistering] = useState(false);
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
      alert("Please enter Name, Email, and Department.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setIsVerifying(true);
      alert("Verification code sent to " + formData.email);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return alert("Please enter the code.");
    setLoading(true);

    // --- UPDATED OTP VERIFICATION LOGIC ---
    // We try 'signup' first for pending users, then fallback to 'login'
    let { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'signup'
    });

    if (otpError) {
      const { error: loginError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'login'
      });
      otpError = loginError;
    }

    if (otpError) {
      setLoading(false);
      alert("Invalid Code or Expired. Please try again.");
      return;
    }

    // --- DATABASE INSERTION ---
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

    if (!bookingError) {
      setIsSuccess(true);
    } else {
      alert("Database Error: " + bookingError.message);
    }
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest">Loading...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Your reservation for <span className="text-slate-900 font-bold">{formData.eventName}</span> has been successfully recorded.
          </p>
          
          <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-3 border border-slate-100">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Hall</span>
              <span className="text-slate-900 font-bold">{hall.name}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Date</span>
              <span className="text-slate-900 font-bold">{format(selectedDate!, 'MMM do, yyyy')}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Time</span>
              <span className="text-slate-900 font-bold">{formData.startTime} - {formData.endTime}</span>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  if (isRegistering && selectedDate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-4 h-4" /></div>
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase text-slate-900">St. Ann's</span>
          </div>
          <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </nav>

        <div className="max-w-4xl mx-auto mt-6 md:mt-12 px-4 md:px-6">
          <div className="bg-white rounded-4xl md:rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center"><Building2 className="text-emerald-400 w-6 h-6 md:w-7 md:h-7" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic">{hall.name}</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Registration</p>
                </div>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 w-full md:w-auto justify-center text-sm">
                <LucideCalendar className="w-5 h-5 text-emerald-400" />
                <span className="font-black uppercase">{format(selectedDate, 'EEEE, MMMM do')}</span>
              </div>
            </div>

            <div className="p-6 md:p-12 space-y-10">
                {!isVerifying ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="col-span-full border-b border-slate-50 pb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Step 1: Event Details</h3>
                    </div>
                    <input type="text" placeholder="FULL NAME *" onChange={e => setFormData({...formData, fullName: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase bg-transparent text-slate-900 placeholder:text-slate-400 w-full" />
                    <input type="email" placeholder="EMAIL ADDRESS *" onChange={e => setFormData({...formData, email: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 w-full" />
                    <input type="text" placeholder="DEPARTMENT *" onChange={e => setFormData({...formData, dept: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase text-slate-900 placeholder:text-slate-400 w-full" />
                    <input type="text" placeholder="EVENT NAME *" onChange={e => setFormData({...formData, eventName: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase text-slate-900 placeholder:text-slate-400 w-full" />
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 text-slate-900 bg-transparent" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 text-slate-900 bg-transparent" />
                    </div>

                    <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
                      {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto text-center space-y-8 py-6 md:py-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-slate-900">Verify Your Email</h3>
                      <p className="text-slate-400 text-sm mt-2 font-medium">
                        Enter the 6-digit code sent to <br/>
                        <span className="text-slate-900 font-bold break-all underline decoration-emerald-500/30">{formData.email}</span>
                      </p>
                    </div>
                    
                    <input 
                      type="text" 
                      maxLength={6} 
                      placeholder="000000" 
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full text-center text-4xl md:text-5xl font-black tracking-[0.3em] border-b-4 border-emerald-500 pb-4 outline-none text-slate-900 bg-transparent placeholder:text-slate-200"
                    />

                    <div className="pt-6 space-y-4">
                      <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all">
                        {loading ? 'Verifying...' : 'Confirm Booking'}
                      </button>
                      <button onClick={() => setIsVerifying(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Edit Info</button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CALENDAR VIEW ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Halls
        </button>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 leading-none uppercase italic">{hall.name}</h1>
        <p className="text-slate-400 font-bold text-sm mb-12 italic opacity-70 tracking-tight">Check below for multiple event schedules.</p>

        <div className="bg-white rounded-4xl md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-50 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-800 uppercase">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 bg-white text-slate-900 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100 uppercase text-[8px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] md:tracking-[0.3em] py-5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 overflow-x-auto min-w-[350px]">
            {calendarDays.map((day, idx) => {
              const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isPast = isBefore(day, todayDate) && !isToday;
              
              return (
                <div key={idx} className={`min-h-[140px] md:min-h-[180px] p-2 md:p-4 border-b border-r border-slate-50 transition-all group relative ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/50 cursor-not-allowed' : 'hover:bg-emerald-50/30 cursor-pointer'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs md:text-base font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                  </div>
                  
                  <div className="space-y-1.5 md:space-y-2 max-h-[80px] md:max-h-[100px] overflow-y-auto no-scrollbar">
                    {dayBookings.map((b, i) => (
                      <div key={i} className="bg-rose-50 border border-rose-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl">
                        <p className="text-[7px] md:text-[9px] font-black text-rose-600 uppercase truncate leading-tight">{b.event_name}</p>
                        <p className="text-[6px] md:text-[8px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-tighter"><Clock className="w-2 md:w-2.5 h-2 md:h-2.5" /> {b.start_time.slice(0,5)}</p>
                      </div>
                    ))}
                  </div>

                  {isCurrentMonth && !isPast && (
                    <button onClick={() => { setSelectedDate(day); setIsRegistering(true); }} className="mt-3 opacity-0 group-hover:opacity-100 w-full py-1.5 md:py-2 border-2 border-dashed border-emerald-200 rounded-xl text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">+ ADD</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}