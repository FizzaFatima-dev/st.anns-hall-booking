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
  ArrowLeft, X, Plus, MapPin, Clock, Calendar, Edit2, Trash2, Inbox, AlertCircle
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
  
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [verificationPurpose, setVerificationPurpose] = useState<'create' | 'edit' | 'delete'>('create');
  const [targetDeleteId, setTargetDeleteId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', dept: '', eventName: '', startTime: '07:30', endTime: '16:30'
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

  const sendAdminAlert = async (type: 'NEW_REQUEST' | 'MODIFICATION' | 'CANCELLATION', detail: any) => {
    try {
      await supabase.functions.invoke('notify-admin', {
        body: { 
          type, 
          hallName: hall?.name || 'Unknown Venue',
          detail: {
            event_name: detail.event_name,
            user_name: detail.user_name || 'N/A',
            user_email: detail.user_email || 'N/A',
            department: detail.department,
            booking_date: detail.booking_date,
            start_time: detail.start_time,
            end_time: detail.end_time
          }
        },
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error("Notification trigger failure:", e);
    }
  };

  const handleSendOTP = async (purpose: 'create' | 'edit' = 'create', existingBooking?: Booking) => {
    setErrorMsg(null);
    const targetEmail = purpose === 'edit' ? existingBooking?.user_email : formData.email;

    if (!targetEmail || !formData.fullName || !formData.dept || !formData.startTime || !formData.endTime || !formData.eventName) {
      setErrorMsg("Please fill out all info fields before verifying.");
      return;
    }
    if (!selectedDate) {
      setErrorMsg("Please select an active date from the calendar.");
      return;
    }
    const minTime = "07:30";
    const maxTime = "16:30";
    if (formData.startTime < minTime || formData.startTime > maxTime || formData.endTime < minTime || formData.endTime > maxTime) {
      setErrorMsg("Operational schedule restriction: 07:30 AM - 04:30 PM.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setErrorMsg("The event end time must follow after your start time.");
      return;
    }

    setLoading(true);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const normStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const normEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    let query = supabase
      .from('bookings')
      .select('event_name, start_time, end_time, status')
      .eq('hall_id', id)
      .eq('booking_date', formattedDate)
      .in('status', ['Confirmed', 'Pending'])
      .lt('start_time', normEnd)
      .gt('end_time', normStart);

    if (purpose === 'edit' && existingBooking) {
      query = query.neq('id', existingBooking.id);
    }

    const { data: conflicts, error: checkError } = await query;

    if (checkError) {
      setLoading(false);
      setErrorMsg("Network error verifying database layout availability.");
      return;
    }

    if (conflicts && conflicts.length > 0) {
      setLoading(false);
      setErrorMsg(`Schedule Conflict: Overlaps with "${conflicts[0].event_name}" (${formatTo12Hr(conflicts[0].start_time)} - ${formatTo12Hr(conflicts[0].end_time)}).`);
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
    e.stopPropagation();
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
    if (otpError) { setLoading(false); setErrorMsg("Security verification code is invalid."); return; }

    if (verificationPurpose === 'delete' && targetDeleteId) {
      const deletedRecord = bookings.find(b => b.id === targetDeleteId);
      const { error: deleteError } = await supabase.from('bookings').delete().eq('id', targetDeleteId);
      setLoading(false);
      if (!deleteError) {
        await sendAdminAlert('CANCELLATION', deletedRecord);
        alert("Booking cancellation request successfully verified.");
        setIsRegistering(false);
        setIsVerifying(false);
        setTargetDeleteId(null);
        refreshBookings();
      } else {
        setErrorMsg("Cancellation error encountered.");
      }
      return;
    }

    if (!selectedDate) { setLoading(false); setErrorMsg('No active calendar date chosen.'); return; }
    const insertStart = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const insertEnd = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    if (verificationPurpose === 'edit' && editingBooking) {
      const updateData = {
        event_name: formData.eventName, booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: insertStart, end_time: insertEnd, user_name: formData.fullName,
        department: formData.dept, status: 'Pending'
      };
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', editingBooking.id);

      setLoading(false);
      if (!updateError) {
        await sendAdminAlert('MODIFICATION', { id: editingBooking.id, ...updateData, user_email: activeEmail });
        setIsSuccess(true);
        triggerConfetti();
      } else {
        setErrorMsg("Failed to update layout reservation slots.");
      }
    } else {
      const insertData = {
        hall_id: id, event_name: formData.eventName, booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: insertStart, end_time: insertEnd, user_name: formData.fullName,
        user_email: activeEmail, department: formData.dept, status: 'Pending'
      };
      const { error: bookingError } = await supabase.from('bookings').insert([insertData]);

      setLoading(false);
      if (!bookingError) {
          await sendAdminAlert('NEW_REQUEST', insertData);
          setIsSuccess(true);
          triggerConfetti();
      } else {
          setErrorMsg("Booking transaction database failure.");
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
    e.stopPropagation();
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

  if (!hall) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans font-medium tracking-[0.2em] text-slate-500 animate-pulse">Synchronizing Visual Assets...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-white" /></div>
            <h2 className="text-2xl font-bold tracking-tight">Request Submitted</h2>
            <p className="text-xs opacity-90 mt-1 tracking-wide">Awaiting administrative validation and approval</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Event Name</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formData.eventName}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[10px] font-medium uppercase text-slate-400 tracking-wider">Date</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedDate ? format(selectedDate, 'MMM do, yyyy') : ''}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Clock className="w-4 h-4 text-emerald-600 mb-2" />
                    <p className="text-[10px] font-medium uppercase text-slate-400 tracking-wider">Time Slot</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatTo12Hr(formData.startTime)} - {formatTo12Hr(formData.endTime)}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200"><MapPin className="text-emerald-600 w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-slate-400 tracking-wider">Location Venue</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{hall.name}</p>
                  </div>
               </div>
            </div>
            <div className="pt-2">
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.98]">Return to Portal</button>
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 py-5 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
             <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">St. Ann's Portal</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-12 pb-24">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 font-semibold text-xs tracking-wider transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Venues
                </button>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">{hall.name}</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 shadow-sm"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Available Slot</div>
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 shadow-sm"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pending Review</div>
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 shadow-sm"><div className="w-2 h-2 rounded-full bg-rose-500" /> Reserved</div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/80 overflow-hidden shadow-xl mb-12">
              <div className="p-6 md:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto justify-center shadow-sm">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 rounded-lg border border-slate-200"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold tracking-wide transition-all">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 rounded-lg border border-slate-200"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                {weekDaysHeader.map((dayName, idx) => (
                  <div key={idx} className="py-3 text-center border-r border-slate-100 last:border-r-0"><span className="text-xs font-semibold text-slate-400 tracking-wider">{dayName}</span></div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-white">
                {calendarDays.map((day: Date, idx: number) => {
                  const dayBookings = bookings.filter((b: Booking) => 
                    b.booking_date && 
                    isSameDay(new Date(b.booking_date), day) &&
                    (b.status === 'Confirmed' || b.status === 'Pending')
                  );
                  
                  const hasPendingOnly = dayBookings.some(b => b.status === 'Pending') && !dayBookings.some(b => b.status === 'Confirmed');
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-[90px] md:min-h-[140px] p-3 border-b border-r border-slate-100 last:border-r-0 transition-all flex flex-col justify-between ${!isCurrentMonth || isPast ? 'opacity-30 bg-slate-50/50 cursor-not-allowed select-none' : 'hover:bg-slate-50/80 cursor-pointer'}`}
                    >
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>{format(day, 'd')}</span>
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-2">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${
                            hasPendingOnly 
                              ? 'bg-amber-50 border-amber-100 text-amber-700' 
                              : 'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${hasPendingOnly ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-bold tracking-wide">
                              {dayBookings.length} {dayBookings.length === 1 ? 'Slot' : 'Slots'}
                              {hasPendingOnly && ' (Hold)'}
                            </span>
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
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-400">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); setErrorMsg(null); setEditingBooking(null); }} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-semibold text-xs tracking-wider transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard Calendar
             </button>
             <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{editingBooking ? 'Reschedule Event Slot' : hall.name}</h2>
                  <p className="text-emerald-600 text-xs font-medium mt-1">{editingBooking ? `Modifying registration for ${editingBooking.user_email}` : `Scheduling Request for ${selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}`}</p>
                </div>
                <div className="p-8">
                   {!isVerifying ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">Host Full Name</label>
                          <input type="text" placeholder="e.g. Dr. Sarah Jenkins" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">Academic Email</label>
                          <input type="email" placeholder="username@academy.edu" disabled={!!editingBooking} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all disabled:opacity-50" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">Department</label>
                          <input type="text" placeholder="e.g. Computer Science" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">Event Title</label>
                          <input type="text" placeholder="e.g. Annual Tech Symposium" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">Start Time (07:30 AM - 04:30 PM)</label>
                          <input type="time" min="07:30" max="16:30" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 tracking-wide">End Time (07:30 AM - 04:30 PM)</label>
                          <input type="time" min="07:30" max="16:30" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-4">
                        {errorMsg && (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-medium text-rose-600">
                            {errorMsg}
                          </div>
                        )}
                        <button onClick={() => handleSendOTP(editingBooking ? 'edit' : 'create', editingBooking || undefined)} disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md">
                          {loading ? 'Processing Transaction...' : editingBooking ? 'Verify & Update Schedule' : 'Verify Identity to Book'}
                        </button>
                      </div>
                    </div>
                   ) : (
                    <div className="max-w-xs mx-auto text-center space-y-6 py-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 tracking-wider mb-2">Enter Verification Passcode</p>
                          <input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-3xl font-bold tracking-[0.3em] bg-slate-50 border border-slate-200 rounded-xl py-3 outline-none text-slate-900 focus:border-emerald-500 focus:bg-white transition-all" />
                        </div>
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm tracking-wide transition-all shadow-md">Verify & Commit</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Daily Agenda</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{format(selectedDate, 'MMMM do')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto pr-1 no-scrollbar">
                {bookings.filter((b: Booking) => 
                  b.booking_date && 
                  isSameDay(new Date(b.booking_date), selectedDate) &&
                  (b.status === 'Confirmed' || b.status === 'Pending')
                ).map((b: Booking, i: number) => (
                    <div key={i} className={`p-4 border rounded-xl flex flex-col justify-between gap-3 sm:flex-row sm:items-center ${b.status === 'Pending' ? 'bg-amber-50/40 border-amber-200/70' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{b.event_name}</p>
                          {b.status === 'Pending' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-md">
                              <AlertCircle size={10}/> Pending Review
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{b.department}</p>
                        
                        <div className="flex gap-4 mt-2.5 pt-2 border-t border-slate-200/60">
                           <button onClick={(e) => startReschedule(e, b)} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-500 transition-colors"><Edit2 size={11}/> Change</button>
                           <button onClick={(e) => startInitiateDelete(e, b)} className="flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-500 transition-colors"><Trash2 size={11}/> Drop</button>
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md self-start sm:self-center whitespace-nowrap ${b.status === 'Pending' ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter((b: Booking) => 
                  b.booking_date && 
                  isSameDay(new Date(b.booking_date), selectedDate) &&
                  (b.status === 'Confirmed' || b.status === 'Pending')
                ).length === 0 && (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <Inbox className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium tracking-wide">No active reservations layout</p>
                    </div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Request Booking Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}