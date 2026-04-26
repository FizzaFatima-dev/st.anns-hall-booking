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
  CheckCircle2, Clock, ArrowLeft, User, Settings, ShieldCheck, Mail
} from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- NEW STATES FOR OTP ---
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

  // --- STEP 1: SEND OTP ---
  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName) {
      alert("Please enter your name and email first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);

    if (error) {
      alert("Error sending code: " + error.message);
    } else {
      setIsVerifying(true);
      alert("6-digit code sent to " + formData.email);
    }
  };

  // --- STEP 2: VERIFY & BOOK ---
  const handleVerifyAndBook = async () => {
    if (!otpCode) return alert("Please enter the code.");
    setLoading(true);

    // 1. Verify the OTP
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'magiclink'
    });

    if (otpError) {
      setLoading(false);
      alert("Invalid or expired code. Please try again.");
      return;
    }

    // 2. If OTP is correct, Save Booking
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
      alert("Verified & Booking Successful!");
      setIsRegistering(false);
      window.location.reload(); 
    } else {
      alert("Database Error: " + bookingError.message);
    }
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest">Loading...</div>;

  // --- VIEW 1: REGISTRATION FORM (WITH OTP UI) ---
  if (isRegistering && selectedDate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <nav className="bg-white border-b border-slate-100 px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100"><Building2 className="text-white w-4 h-4" /></div>
            <span className="text-xl font-black tracking-tighter uppercase text-slate-900">St. Ann's</span>
          </div>
          <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </nav>

        <div className="max-w-4xl mx-auto mt-12 px-6">
          <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center"><Building2 className="text-emerald-400 w-7 h-7" /></div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase italic">{hall.name}</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Verification Required</p>
                </div>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <LucideCalendar className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-black uppercase">{format(selectedDate, 'EEEE, MMMM do')}</span>
              </div>
            </div>

            <div className="p-12 space-y-12">
                {!isVerifying ? (
                  // STEP 1 UI: GATHER DETAILS
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="col-span-full border-b border-slate-50 pb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Step 1: Event Details</h3>
                    </div>
                    <input type="text" placeholder="FULL NAME *" onChange={e => setFormData({...formData, fullName: e.target.value})} className="border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500 uppercase" />
                    <input type="email" placeholder="EMAIL ADDRESS *" onChange={e => setFormData({...formData, email: e.target.value})} className="border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500" />
                    <input type="text" placeholder="DEPARTMENT *" onChange={e => setFormData({...formData, dept: e.target.value})} className="border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500 uppercase" />
                    <input type="text" placeholder="EVENT NAME *" onChange={e => setFormData({...formData, eventName: e.target.value})} className="border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500 uppercase" />
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border-b-2 border-slate-100 py-3 font-bold text-sm outline-none focus:border-emerald-500" />
                    </div>

                    <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">
                      {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                  </div>
                ) : (
                  // STEP 2 UI: OTP VERIFICATION
                  <div className="max-w-md mx-auto text-center space-y-8 py-10">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">Verify Your Email</h3>
                      <p className="text-slate-400 text-sm mt-2">Enter the 6-digit code sent to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
                    </div>
                    <input 
                      type="text" 
                      maxLength={8} 
                      placeholder="000000" 
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full text-center text-4xl font-black tracking-[0.5em] border-b-4 border-emerald-500 pb-4 outline-none"
                    />
                    <div className="pt-6 space-y-4">
                      <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all">
                        {loading ? 'Verifying...' : 'Verify & Confirm Booking'}
                      </button>
                      <button onClick={() => setIsVerifying(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Edit Email</button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CALENDAR (UNCHANGED LOGIC) ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-12 pt-12 pb-24">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Halls
        </button>

        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-3 leading-none uppercase italic">{hall.name}</h1>
        <p className="text-slate-400 font-bold text-sm mb-12 italic opacity-70 tracking-tight">Select an available date to register your event.</p>

        <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden mb-10">
          <div className="p-10 flex justify-between items-center border-b border-slate-50">
            <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 bg-white text-slate-900 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-[0.3em] py-5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isPast = isBefore(day, todayDate) && !isToday;
              
              return (
                <div key={idx} className={`min-h-[160px] p-5 border-b border-r border-slate-50 transition-all group relative ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/50 cursor-not-allowed' : 'hover:bg-emerald-50/30 cursor-pointer'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-base font-black w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                  </div>
                  <div className="space-y-2">
                    {dayBookings.map((b, i) => (
                      <div key={i} className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                        <p className="text-[9px] font-black text-rose-600 uppercase truncate leading-tight">{b.event_name}</p>
                        <p className="text-[8px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-tighter"><Clock className="w-2.5 h-2.5" /> {b.start_time} - {b.end_time}</p>
                      </div>
                    ))}
                    {isCurrentMonth && !isPast && dayBookings.length === 0 && (
                      <button onClick={() => { setSelectedDate(day); setIsRegistering(true); }} className="opacity-0 group-hover:opacity-100 w-full py-3 border-2 border-dashed border-emerald-200 rounded-xl text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">+ BOOK SLOT</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}