// @ts-nocheck
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, 
  ArrowLeft, X, Plus, AlertCircle, MapPin, Clock, Calendar
} from 'lucide-react';

interface Hall {
  id: string | number;
  name: string;
}

interface Booking {
  id?: string | number;
  hall_id: string | number;
  event_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  user_name?: string;
  user_email?: string;
  department: string;
  status?: string;
}

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', dept: '', eventName: '', startTime: '', endTime: ''
  });

  const formatTo12Hr = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const { data: hallData } = await supabase.from('halls').select('*').eq('id', id).single();
      
      if (hallData) {
        let finalName = hallData.name;
        if (hallData.name === "Seminar Hall 1") finalName = "Gnanamma Hall";
        else if (hallData.name === "Seminar Hall 2") finalName = "Deickmann Hall";
        else if (hallData.name.includes("Auditorium")) finalName = "St. Joseph's Auditorium";
        
        setHall({ id: hallData.id, name: finalName });
      }

      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id).order('start_time', { ascending: true });
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    setErrorMsg(null);
    if (!formData.email || !formData.fullName || !formData.dept || !formData.startTime || !formData.endTime || !formData.eventName) {
      setErrorMsg("Missing Information: Please fill all fields.");
      return;
    }
    if (!selectedDate) {
      setErrorMsg("Please select a date before confirming booking.");
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

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const normStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const normEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    const { data: conflicts, error: checkError } = await supabase
      .from('bookings')
      .select('event_name, start_time, end_time')
      .eq('hall_id', id)
      .eq('booking_date', formattedDate)
      .lt('start_time', normEnd)
      .gt('end_time', normStart);

    if (checkError) {
      setLoading(false);
      setErrorMsg("Database Error: Could not verify availability.");
      return;
    }

    if (conflicts && conflicts.length > 0) {
      setLoading(false);
      setErrorMsg(`Schedule Conflict: Overlaps with "${conflicts[0].event_name}" (${formatTo12Hr(conflicts[0].start_time)} - ${formatTo12Hr(conflicts[0].end_time)}).`);
      return;
    }

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

    if (!selectedDate) { setLoading(false); setErrorMsg('No date selected.'); return; }
    const insertStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const insertEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    const { error: bookingError } = await supabase.from('bookings').insert([{
      hall_id: id, event_name: formData.eventName, booking_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: insertStart, end_time: insertEnd, user_name: formData.fullName,
      user_email: formData.email.toLowerCase(), department: formData.dept, status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) {
        setIsSuccess(true);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.onload = () => (window as any).confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        document.head.appendChild(script);
    } else {
        setErrorMsg("Booking Failed. Please contact administration.");
    }
  };

  if (!hall) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-semibold text-xs tracking-[0.2em] text-slate-400 animate-pulse tracking-widest">LOADING...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 antialiased selection:bg-emerald-500/10">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-900 p-8 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-white tracking-tight">Booking Receipt</h2>
            <p className="text-xs text-slate-400 mt-1">Transaction Completed Successfully</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-4">
               <div className="border-b border-slate-100 pb-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Event Name</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{formData.eventName}</p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400 mb-1.5" />
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400 mb-1.5" />
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Time Slot</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{formatTo12Hr(formData.startTime)} - {formatTo12Hr(formData.endTime)}</p>
                  </div>
               </div>
               <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm"><MapPin className="text-emerald-500 w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Venue</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{hall.name}</p>
                  </div>
               </div>
            </div>
            <div className="pt-2">
              <button onClick={() => router.push('/')} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium text-xs tracking-wide hover:bg-slate-800 transition-all shadow-md active:scale-[0.99]">Return to Portal</button>
            </div>
          </div>
          <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
             <p className="text-[10px] font-medium text-slate-400 tracking-wide">St. Ann's Hall Booking System</p>
          </div>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-slate-50/40 antialiased selection:bg-emerald-500/10">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-4 sticky top-0 z-40 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10 overflow-hidden">
             <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-20">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-4 font-medium text-xs tracking-wide transition-colors group">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Halls
                </button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{hall.name}</h1>
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[11px] font-medium text-slate-600">Available</span></div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0"><div className="w-2 h-2 rounded-full bg-rose-400" /><span className="text-[11px] font-medium text-slate-600">Reserved</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
              <div className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm w-full sm:w-auto justify-between">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 bg-slate-950 text-white rounded-lg font-medium text-xs tracking-wide transition-all hover:bg-slate-900">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-slate-100/50 gap-[1px]">
                {calendarDays.map((day: Date, idx: number) => {
                  const dayBookings = bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-[80px] md:min-h-[120px] p-3 bg-white transition-all relative flex flex-col justify-between ${!isCurrentMonth || isPast ? 'opacity-30 bg-slate-50/50 cursor-not-allowed' : 'hover:bg-slate-50/80 cursor-pointer active:scale-[0.99]'}`}
                    >
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-800'}`}>{format(day, 'd')}</span>
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-2 w-full">
                          <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-lg">
                            <div className="w-1 h-1 rounded-full bg-rose-400" />
                            <span className="text-[10px] font-semibold text-rose-600 whitespace-nowrap">{dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}</span>
                          </div>
                          <div className="md:hidden w-1.5 h-1.5 rounded-full bg-rose-400 mx-auto" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); setErrorMsg(null); }} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-6 font-medium text-xs tracking-wide transition-colors group">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Return to Calendar
             </button>
             <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-slate-950 p-6 md:p-8 text-white relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                  <h2 className="text-xl font-bold tracking-tight mb-1">{hall.name}</h2>
                  <p className="text-emerald-400 text-xs font-medium">Request for {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</p>
                </div>
                <div className="p-6 md:p-10">
                   {!isVerifying ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">Host Full Name</label>
                          <input type="text" placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl outline-none bg-transparent text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">Academic Email</label>
                          <input type="email" placeholder="name@stanns.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl outline-none bg-transparent text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">Department</label>
                          <input type="text" placeholder="Computer Science" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl outline-none bg-transparent text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">Event Title</label>
                          <input type="text" placeholder="Guest Lecture on AI" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl outline-none bg-transparent text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">Start Time</label>
                          <input type="time" min="07:30" max="16:30" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-medium outline-none text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-500">End Time</label>
                          <input type="time" min="07:30" max="16:30" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-medium outline-none text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all" />
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-4">
                        {errorMsg && (
                          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
                            <AlertCircle className="text-rose-500 w-4 h-4 shrink-0" />
                            <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
                          </div>
                        )}
                        <button onClick={handleSendOTP} disabled={loading} className="w-full py-3 bg-slate-950 text-white rounded-xl font-medium text-xs tracking-wide shadow-md active:scale-[0.99] hover:bg-slate-900 transition-all disabled:opacity-50">
                          {loading ? 'Validating Schedule...' : 'Confirm Booking'}
                        </button>
                      </div>
                    </div>
                   ) : (
                    <div className="max-w-xs mx-auto text-center space-y-6 py-4">
                        <div className="space-y-2">
                           <p className="text-xs font-semibold text-slate-400 tracking-wide">Enter Verification Code</p>
                           <input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-3xl font-bold border-b border-slate-200 outline-none text-slate-900 pb-2 bg-transparent tracking-widest focus:border-slate-400 transition-colors" />
                        </div>
                        {errorMsg && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center gap-2">
                            <AlertCircle className="text-rose-500 w-3.5 h-3.5 shrink-0" />
                            <p className="text-[11px] font-medium text-rose-600">{errorMsg}</p>
                          </div>
                        )}
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-xs tracking-wide shadow-md active:scale-[0.99] transition-all hover:bg-emerald-500 disabled:opacity-50">Verify & Complete</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white relative">
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-emerald-400 mb-0.5">Daily Agenda</p>
                <h3 className="text-base font-bold">{format(selectedDate, 'MMM do, yyyy')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="space-y-2.5 mb-6 max-h-[30vh] overflow-y-auto pr-1">
                {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).map((b: Booking, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                      <div className="min-w-0 pr-2">
                         <p className="text-xs font-bold text-slate-900 truncate">{b.event_name}</p>
                         <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{b.department}</p>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 bg-white px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap shrink-0 shadow-sm">{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl"><p className="text-xs font-medium text-slate-400">No Reservations Scheduled</p></div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors"><Plus className="w-4 h-4" /> Request Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}