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
  ChevronLeft, ChevronRight, Building2, 
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Plus, X, Info, Sparkles, CalendarDays
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
        toast.success("OTP sent!");
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
      toast.error("Invalid code.");
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
      
      {/* HEADER NAV */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight uppercase italic">St. Ann's</span>
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-all">
          Exit
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12">
        {!isRegistering ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN: INFO & GUIDE */}
            <div className="lg:col-span-4 space-y-10">
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase italic leading-[0.9] mb-6">{hall.name}</h1>
                
                {/* ADVANCED STATUS PILLS */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Live & Available</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reserved Slots</span>
                  </div>
                </div>
              </div>

              {/* CLEAN WHITE BOOKING GUIDE */}
              <div className="bg-white border-2 border-emerald-500/10 rounded-[2rem] p-8 shadow-sm relative group overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-bounce" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Booking Guide</h3>
                </div>
                
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight leading-relaxed">Select a preferred date and time slot from the calendar.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight leading-relaxed">Enter your departmental event details and credentials.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight leading-relaxed">Instantly book your slot via email verification.</p>
                  </li>
                </ul>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
              </div>
            </div>

            {/* RIGHT COLUMN: CALENDAR */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                  <h2 className="text-xl font-black uppercase italic tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                  <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors">Today</button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center py-4 border-b border-slate-50 bg-white">
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
                        className={`min-h-[110px] md:min-h-[150px] p-4 border-b border-r border-slate-50 transition-all relative group
                          ${!isCurrentMonth || isPast ? 'bg-slate-50/40 opacity-20 cursor-not-allowed' : 'hover:bg-emerald-50/40 cursor-pointer'}
                          ${isToday ? 'bg-emerald-50/20' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[13px] font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all
                            ${isToday ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-900'}`}>
                            {format(day, 'd')}
                          </span>
                          
                          {/* PLUS ICON */}
                          {isCurrentMonth && !isPast && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all p-1 bg-emerald-600 rounded-md shadow-lg shadow-emerald-200 transform translate-y-1 group-hover:translate-y-0">
                              <Plus className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-6">
                          {dayBookings.map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm animate-in fade-in zoom-in" />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM REMAINS REFINED */
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 mb-8 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Schedule
             </button>
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="bg-slate-950 p-10 text-white flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black uppercase italic leading-none mb-1">{hall.name}</h2>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Confirm Reservation</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Target</p>
                      <p className="font-black uppercase italic text-sm">{format(selectedDate!, 'MMM do, yyyy')}</p>
                    </div>
                </div>
                <div className="p-10 md:p-14 space-y-8">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                          <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all uppercase text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Campus Email</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-sm" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Event Agenda</label>
                          <input type="text" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all uppercase text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Starts</label>
                          <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ends</label>
                          <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900" />
                        </div>
                        <button onClick={handleSendOTP} disabled={loading} className="md:col-span-2 w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all mt-4">
                          {loading ? 'Processing...' : 'Verify & Send OTP'}
                        </button>
                    </div>
                   ) : (
                    <div className="text-center space-y-8 py-6">
                        <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto" />
                        <div>
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Enter Code</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verification sent to your email</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-transparent text-center text-6xl font-black tracking-[0.2em] border-b-4 border-emerald-600 outline-none text-slate-950 transition-all" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Complete Booking</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL (Daily View) */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black uppercase italic tracking-tight">{format(selectedDate, 'MMMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-8 pr-2">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-emerald-200 transition-all">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase italic mb-1">{b.event_name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{b.department}</p>
                      </div>
                      <div className="text-rose-500 text-[10px] font-black flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {b.start_time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Reserved Events</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }}
                className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Secure This Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}