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
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, Plus, X, Info
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

  if (!hall) return <div className="h-screen flex items-center justify-center font-bold text-emerald-600 animate-pulse uppercase tracking-widest">Loading...</div>;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-12">
      <Toaster position="top-center" />
      
      {/* Dynamic Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">St. Ann's</span>
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-all">
          Exit
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8">
        {!isRegistering ? (
          <>
            {/* Header Section */}
            <div className="mb-8">
               <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-slate-400 mb-4 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Halls
              </button>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase italic leading-tight">{hall.name}</h1>
              
              {/* Legend for Mobile */}
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Free
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-rose-500" /> Booked
                </div>
              </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-lg font-black uppercase italic tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center py-4 bg-slate-50/50 border-b border-slate-100">
                {['S','M','T','W','T','F','S'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
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
                      className={`min-h-[80px] md:min-h-[110px] p-2 border-b border-r border-slate-100 transition-all relative
                        ${!isCurrentMonth || isPast ? 'bg-slate-50/30 opacity-30 cursor-not-allowed' : 'hover:bg-emerald-50 cursor-pointer'}
                        ${isToday ? 'bg-emerald-50/50' : ''}`}
                    >
                      <span className={`text-xs font-black p-1.5 rounded-lg inline-block
                        ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-900'}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-emerald-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row gap-8 shadow-lg shadow-emerald-900/20">
               <div className="flex-1 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black">1</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Select</p>
                  <p className="text-xs text-emerald-100/70">Pick an open date on the calendar.</p>
               </div>
               <div className="flex-1 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black">2</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Verify</p>
                  <p className="text-xs text-emerald-100/70">Use your campus email for OTP.</p>
               </div>
               <div className="flex-1 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black">3</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Confirm</p>
                  <p className="text-xs text-emerald-100/70">Your booking is active instantly.</p>
               </div>
            </div>
          </>
        ) : (
          /* REGISTRATION FORM (Optimized for Mobile) */
          <div className="max-w-2xl mx-auto">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-1.5 text-slate-400 mb-6 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Calendar
             </button>
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black uppercase italic leading-none mb-1">{hall.name}</h2>
                      <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">Booking Request</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10">
                      {format(selectedDate!, 'MMM do, yyyy')}
                    </div>
                </div>
                <div className="p-8 md:p-12">
                   {!isVerifying ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                          <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-sm uppercase" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Campus Email</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Event Title</label>
                          <input type="text" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-sm uppercase" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Starts</label>
                            <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ends</label>
                            <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500" />
                          </div>
                        </div>
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] mt-4">
                        {loading ? 'Processing...' : 'Send Verification OTP'}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-xs mx-auto text-center space-y-8 py-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                          <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase italic tracking-tight">Enter Code</h3>
                          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Sent to {formData.email}</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-transparent text-center text-5xl font-black tracking-[0.2em] border-b-4 border-emerald-600 outline-none text-slate-900 transition-all placeholder:text-slate-100" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Verify & Confirm</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL (Agenda) */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight">{format(selectedDate, 'MMMM do')}</h3>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Agenda Overview</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-8">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none mb-1">{b.event_name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{b.department}</p>
                      </div>
                      <div className="flex items-center gap-1 text-rose-500 text-[10px] font-black">
                        <Clock className="w-3 h-3" />
                        {b.start_time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 opacity-40">
                    <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Reserved Slots</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }}
                className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Request Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}