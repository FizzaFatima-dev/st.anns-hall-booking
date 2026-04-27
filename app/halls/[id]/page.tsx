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
  CheckCircle2, Clock, ArrowLeft, User, ShieldCheck, Info, AlertCircle
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
    if (!formData.email || !formData.fullName || !formData.dept || !formData.eventName) {
      alert("Please fill all required fields marked with *");
      return;
    }

    setLoading(true);

    // CONFLICT CHECK: Make sure no one booked this while they were filling the form
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('hall_id', id)
      .eq('booking_date', format(selectedDate!, 'yyyy-MM-dd'));

    if (existing && existing.length > 0) {
        alert("Wait! Someone just booked this date. Please pick another day.");
        setLoading(false);
        setIsRegistering(false);
        return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    
    setLoading(false);

    if (error) {
      if (error.message.includes("rate limit")) {
        alert("The system limit is reached (2 per hour). Please wait or try again later.");
      } else {
        alert("Error: " + error.message);
      }
    } else {
      setIsVerifying(true);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return alert("Please enter the code.");
    setLoading(true);

    const types = ['signup', 'login', 'invite'];
    let isVerified = false;

    for (const type of types) {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: type as any
      });
      if (!error) { isVerified = true; break; }
    }

    if (!isVerified) {
      setLoading(false);
      alert("Invalid Code. Ensure you use the LATEST code.");
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
    else alert("Database Error: " + bookingError.message);
  };

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest text-xl">St. Ann's Loading...</div>;

  // --- SUCCESS VIEW ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">Your reservation for <span className="text-slate-900 font-bold">{formData.eventName}</span> is now official.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">Back to Home</button>
        </div>
      </div>
    );
  }

  // --- REGISTRATION & CALENDAR VIEWS ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  if (isRegistering && selectedDate) {
      // (Registration Form remains same as previous logic but includes 'value' for controlled inputs)
      return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
          <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center"><Building2 className="text-white w-5 h-5" /></div>
              <span className="text-xl font-black tracking-tighter uppercase text-slate-900">St. Ann's Portal</span>
            </div>
            <button onClick={() => setIsRegistering(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400"><ArrowLeft className="inline w-4 h-4" /> Cancel</button>
          </nav>
          
          <div className="max-w-4xl mx-auto mt-10 px-4">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic">{hall.name}</h2>
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">Confirming for {format(selectedDate, 'MMM do, yyyy')}</p>
                    </div>
                    <LucideCalendar className="w-10 h-10 text-white/20" />
                </div>
                
                <div className="p-12">
                    {!isVerifying ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <input type="text" placeholder="FULL NAME *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="border-b-2 border-slate-200 py-4 font-bold outline-none focus:border-emerald-500 uppercase" />
                            <input type="email" placeholder="COLLEGE EMAIL *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border-b-2 border-slate-200 py-4 font-bold outline-none focus:border-emerald-500" />
                            <input type="text" placeholder="DEPARTMENT *" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="border-b-2 border-slate-200 py-4 font-bold outline-none focus:border-emerald-500 uppercase" />
                            <input type="text" placeholder="EVENT NAME *" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="border-b-2 border-slate-200 py-4 font-bold outline-none focus:border-emerald-500 uppercase" />
                            <div className="flex flex-col"><label className="text-[10px] font-black text-slate-400 mb-1">START TIME</label><input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="border-b-2 border-slate-200 pb-2 font-bold outline-none" /></div>
                            <div className="flex flex-col"><label className="text-[10px] font-black text-slate-400 mb-1">END TIME</label><input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="border-b-2 border-slate-200 pb-2 font-bold outline-none" /></div>
                            <button onClick={handleSendOTP} disabled={loading} className="md:col-span-2 mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all">{loading ? 'Processing...' : 'Verify Email to Book'}</button>
                        </div>
                    ) : (
                        <div className="max-w-sm mx-auto text-center space-y-8">
                            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto" />
                            <h3 className="text-xl font-black uppercase italic">Enter OTP</h3>
                            <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-5xl font-black border-b-4 border-emerald-500 outline-none pb-2 bg-transparent" />
                            <button onClick={handleVerifyAndBook} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700">Confirm Booking</button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Halls
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic leading-none">{hall.name}</h1>
                <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booked</span></div>
                </div>
            </div>
            
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-start gap-4 max-w-sm">
                <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                    Select a <span className="text-emerald-600">Green</span> date to start. Only college emails are authorized for verification.
                </p>
            </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 bg-white text-slate-900 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-widest">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-slate-50/50 uppercase text-[10px] font-black text-slate-400 tracking-[0.3em] py-5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 border-t border-slate-50">
            {calendarDays.map((day, idx) => {
              const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isPast = isBefore(day, todayDate) && !isToday;
              const isFull = dayBookings.length > 0;
              
              return (
                <div key={idx} className={`min-h-[160px] p-4 border-b border-r border-slate-50 group relative ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-lg font-black w-10 h-10 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                    {isCurrentMonth && !isPast && !isFull && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {dayBookings.map((b, i) => (
                      <div key={i} className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                        <p className="text-[10px] font-black text-rose-600 uppercase truncate">{b.event_name}</p>
                        <p className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter">{b.start_time} - {b.end_time}</p>
                      </div>
                    ))}
                  </div>

                  {isCurrentMonth && !isPast && !isFull && (
                    <button onClick={() => { setSelectedDate(day); setIsRegistering(true); }} className="mt-4 opacity-0 group-hover:opacity-100 w-full py-2 border-2 border-dashed border-emerald-200 rounded-xl text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">+ CLICK TO BOOK</button>
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