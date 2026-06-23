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
  ArrowLeft, X, Plus, AlertCircle, MapPin, Clock, Calendar, Edit2, Trash2
} from 'lucide-react';

interface Hall {
  id: string | number;
  name: string;
}

interface Booking {
  id: string | number;
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
  
  // Rescheduling States
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [verificationPurpose, setVerificationPurpose] = useState<'create' | 'edit' | 'delete'>('create');
  const [targetDeleteId, setTargetDeleteId] = useState<string | number | null>(null);

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

  async function refreshBookings() {
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('hall_id', id)
      .order('start_time', { ascending: true });
    if (bookingData) setBookings(bookingData);
  }

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
      refreshBookings();
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async (purpose: 'create' | 'edit' = 'create', existingBooking?: Booking) => {
    setErrorMsg(null);
    const targetEmail = purpose === 'edit' ? existingBooking?.user_email : formData.email;

    if (!targetEmail || !formData.fullName || !formData.dept || !formData.startTime || !formData.endTime || !formData.eventName) {
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

    // Check availability excluding the slot we are currently editing
    let query = supabase
      .from('bookings')
      .select('event_name, start_time, end_time')
      .eq('hall_id', id)
      .eq('booking_date', formattedDate)
      .lt('start_time', normEnd)
      .gt('end_time', normStart);

    if (purpose === 'edit' && existingBooking) {
      query = query.neq('id', existingBooking.id);
    }

    const { data: conflicts, error: checkError } = await query;

    if (checkError) {
      setLoading(false);
      setErrorMsg("Database Error: Could not verify availability.");
      return;
    }

    if (conflicts && conflicts.length > 0) {
      setLoading(false);
      setErrorMsg(`Schedule Conflict: This time overlaps with "${conflicts[0].event_name}" (${formatTo12Hr(conflicts[0].start_time)} - ${formatTo12Hr(conflicts[0].end_time)}).`);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail.toLowerCase(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setVerificationPurpose(purpose);
      setIsVerifying(true);
    }
  };

  const startInitiateDelete = async (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation(); // Prevents close tracking layout bug
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: booking.user_email?.toLowerCase(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setTargetDeleteId(booking.id);
      setVerificationPurpose('delete');
      setIsPopupOpen(false);
      setIsRegistering(true);
      setIsVerifying(true);
    }
  };

  const handleVerifyAndBook = async () => {
    setLoading(true);
    const activeEmail = (verificationPurpose === 'create' ? formData.email : (editingBooking?.user_email || bookings.find(b => b.id === targetDeleteId)?.user_email || '')).toLowerCase();
    
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: activeEmail, token: otpCode, type: 'email' 
    });
    if (otpError) { setLoading(false); setErrorMsg("Invalid Security Code. Try again."); return; }

    if (verificationPurpose === 'delete' && targetDeleteId) {
      const { error: deleteError } = await supabase.from('bookings').delete().eq('id', targetDeleteId);
      setLoading(false);
      if (!deleteError) {
        alert("Booking cancelled successfully.");
        setIsRegistering(false);
        setIsVerifying(false);
        setTargetDeleteId(null);
        refreshBookings();
      } else {
        setErrorMsg("Cancellation failed. Contact system administrator.");
      }
      return;
    }

    if (!selectedDate) { setLoading(false); setErrorMsg('No date selected.'); return; }
    const insertStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const insertEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    if (verificationPurpose === 'edit' && editingBooking) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          event_name: formData.eventName, booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: insertStart, end_time: insertEnd, user_name: formData.fullName,
          department: formData.dept
        })
        .eq('id', editingBooking.id);

      setLoading(false);
      if (!updateError) {
        setIsSuccess(true);
        triggerConfetti();
      } else {
        setErrorMsg("Failed to update schedule slot.");
      }
    } else {
      const { error: bookingError } = await supabase.from('bookings').insert([{
        hall_id: id, event_name: formData.eventName, booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: insertStart, end_time: insertEnd, user_name: formData.fullName,
        user_email: activeEmail, department: formData.dept, status: 'Confirmed'
      }]);

      setLoading(false);
      if (!bookingError) {
          setIsSuccess(true);
          triggerConfetti();
      } else {
          setErrorMsg("Booking Failed. Please contact administration.");
      }
    }
  };

  const triggerConfetti = () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => (window as any).confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    document.head.appendChild(script);
  };

  const startReschedule = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation(); // Prevents close tracking layout bug
    setEditingBooking(booking);
    setSelectedDate(new Date(booking.booking_date));
    setFormData({
      fullName: booking.user_name || '',
      email: booking.user_email || '',
      dept: booking.department,
      eventName: booking.event_name,
      startTime: booking.start_time.slice(0, 5),
      endTime: booking.end_time.slice(0, 5)
    });
    setIsPopupOpen(false);
    setIsRegistering(true);
    setIsVerifying(false);
  };

  if (!hall) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bold uppercase tracking-[0.4em] text-slate-300 animate-pulse">Loading...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-emerald-600 p-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3"><CheckCircle2 className="w-8 h-8" /></div>
            <h2 className="text-2xl font-bold uppercase italic tracking-widest">Receipt Updated</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 mt-1">Transaction Completed Successfully</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Event Name</p>
                    <p className="text-lg font-bold text-slate-900 uppercase leading-tight">{formData.eventName}</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Date</p>
                    <p className="text-[11px] font-bold text-slate-900">{selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Clock className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Time Slot</p>
                    <p className="text-[11px] font-bold text-slate-900">{formatTo12Hr(formData.startTime)} - {formatTo12Hr(formData.endTime)}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><MapPin className="text-emerald-600 w-5 h-5" /></div>
                  <div>
                    <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Venue</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">{hall.name}</p>
                  </div>
               </div>
            </div>
            <div className="pt-4">
              <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">Return to Portal</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const todayDate = startOfDay(new Date());
  const weekDaysHeader = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
             <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-slate-900 uppercase">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-24">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-bold text-[10px] uppercase tracking-[0.4em] transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Halls
                </button>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 uppercase leading-tight">{hall.name}</h1>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">Available</span></div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" /><span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">Reserved</span></div>
              </div>
            </div>

            <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden mb-20">
              <div className="p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-50 bg-slate-50/20">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-[1.8rem] border border-slate-200 w-full md:w-auto justify-center">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-bold text-[10px] uppercase tracking-[0.3em]">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-l border-b border-slate-100 bg-slate-50/50">
                {weekDaysHeader.map((dayName, idx) => (
                  <div key={idx} className="py-4 text-center border-r border-slate-100"><span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">{dayName}</span></div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-l">
                {calendarDays.map((day: Date, idx: number) => {
                  const dayBookings = bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-20 md:min-h-40 p-2 md:p-6 border-b border-r border-slate-100 transition-all group relative ${!isCurrentMonth || isPast ? 'opacity-30 bg-slate-100/40 cursor-not-allowed select-none' : 'hover:bg-emerald-50/30 cursor-pointer'}`}
                    >
                      <span className={`text-sm md:text-lg font-bold w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl mb-2 ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-800'}`}>{format(day, 'd')}</span>
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-auto hidden md:block">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="text-[9px] font-extrabold uppercase text-rose-600 tracking-wider">{dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); setErrorMsg(null); setEditingBooking(null); }} className="flex items-center gap-3 text-slate-400 hover:text-emerald-600 mb-10 font-bold text-[10px] uppercase tracking-[0.4em] transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Return to Calendar
             </button>
             <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 md:p-16 text-white relative">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase mb-2 leading-none">{editingBooking ? 'Reschedule Event' : hall.name}</h2>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">{editingBooking ? `Modifying slot for ${editingBooking.user_email}` : `Request for ${selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}`}</p>
                </div>
                <div className="p-8 md:p-20">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500">
                        <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Host Full Name</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500">
                        <input type="email" placeholder="Email Address" disabled={!!editingBooking} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="w-full py-2 font-bold text-xl outline-none bg-transparent text-slate-900 disabled:opacity-50" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Academic Email</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500">
                        <input type="text" placeholder="Department" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Department</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500">
                        <input type="text" placeholder="Event Name" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Event Title</label>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" min="07:30" max="16:30" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg text-slate-900" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" min="07:30" max="16:30" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg text-slate-900" />
                      </div>
                      
                      <div className="col-span-full mt-10 space-y-6">
                        {errorMsg && (
                          <div className="p-5 bg-rose-50 border border-rose-200 rounded-4xl flex items-center gap-4">
                            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">{errorMsg}</p>
                          </div>
                        )}
                        <button onClick={() => handleSendOTP(editingBooking ? 'edit' : 'create', editingBooking || undefined)} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-[12px] uppercase tracking-[0.4em]">
                          {loading ? 'Processing...' : editingBooking ? 'Verify & Reschedule' : 'Confirm Booking'}
                        </button>
                      </div>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-12 py-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.4em] mb-4">Verification Security Code</p>
                          <input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-4xl font-bold tracking-[0.5em] border-b-2 border-emerald-500 outline-none text-slate-900 pb-6 bg-transparent" />
                        </div>
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold uppercase text-[10px] tracking-[0.4em]">Verify Identity</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-400 mb-1">Daily Agenda</p>
                <h3 className="text-2xl font-bold tracking-tighter uppercase leading-none">{format(selectedDate, 'MMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-2">
                {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).map((b: Booking, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900 uppercase mb-1">{b.event_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.department}</p>
                        
                        {/* Interactive Self-Service Actions */}
                        <div className="flex gap-4 mt-3 pt-2 border-t border-slate-200/60">
                           <button onClick={(e) => startReschedule(e, b)} className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"><Edit2 size={10}/> Reschedule</button>
                           <button onClick={(e) => startInitiateDelete(e, b)} className="flex items-center gap-1.5 text-[9px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"><Trash2 size={10}/> Cancel Slot</button>
                        </div>
                      </div>
                      <div className="text-[9px] font-bold text-emerald-600 bg-white px-3 py-2 rounded-xl border border-slate-100 self-start">{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl"><p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">No Reservations</p></div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold text-[10px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3"><Plus className="w-5 h-5" /> Request Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}