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
  ArrowLeft, X, Plus, AlertCircle, MapPin, Clock, Calendar, Filter, Download
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
  event_type?: 'academic' | 'cultural'; // Feature 1: Dual-tone categorization
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

  // Feature 1 States: Filter states for category tracking
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'academic' | 'cultural'>('all');

  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    dept: '', 
    eventName: '', 
    startTime: '09:00', 
    endTime: '13:00',
    eventType: 'academic' as 'academic' | 'cultural'
  });

  // Feature 3: Defined Time-slot breakdown configurations
  const timeSlots = [
    { label: "Morning Session", start: "07:30", end: "12:00" },
    { label: "Afternoon Session", start: "12:00", end: "16:30" }
  ];

  const formatTo12Hr = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  // Feature 4: Google Calendar Direct Link Generator
  const generateGoogleCalendarLink = () => {
    if (!selectedDate || !hall) return '#';
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const dateStr = format(selectedDate, 'yyyyMMdd');
    const startClean = formData.startTime.replace(':', '') + '00';
    const endClean = formData.endTime.replace(':', '') + '00';
    
    const text = encodeURIComponent(`[${formData.eventType.toUpperCase()}] ${formData.eventName}`);
    const dates = `${dateStr}T${startClean}/${dateStr}T${endClean}`;
    const details = encodeURIComponent(`Organized by ${formData.fullName} (${formData.dept}) via St. Ann's Portal.`);
    const location = encodeURIComponent(hall.name);

    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
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

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('event_name, start_time, end_time')
      .eq('hall_id', id)
      .eq('booking_date', formattedDate)
      .lt('start_time', normEnd)
      .gt('end_time', normStart);

    if (conflicts && conflicts.length > 0) {
      setLoading(false);
      setErrorMsg(`Schedule Conflict: This time overlaps with "${conflicts[0].event_name}" (${formatTo12Hr(conflicts[0].start_time)} - ${formatTo12Hr(conflicts[0].end_time)}).`);
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
      user_email: formData.email.toLowerCase(), email: formData.email.toLowerCase(), department: formData.dept, 
      status: 'Confirmed', event_type: formData.eventType
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

  if (!hall) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bold uppercase tracking-[0.4em] text-slate-300 animate-pulse">Loading...</div>;

  // Render Page State: Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-emerald-600 p-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3"><CheckCircle2 className="w-8 h-8" /></div>
            <h2 className="text-2xl font-bold uppercase italic tracking-widest">Booking Confirmed</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 mt-1">Transaction Successful</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Event Name</p>
                    <p className="text-lg font-bold text-slate-900 uppercase leading-tight">{formData.eventName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider ${formData.eventType === 'academic' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                    {formData.eventType}
                  </span>
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
            </div>
            
            {/* Feature 4 Implementation: Live Instant Sync Button Layout */}
            <div className="pt-2 space-y-3">
              <a 
                href={generateGoogleCalendarLink()} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full py-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-100/70 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Sync to Google Calendar
              </a>
              <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl">
                Return to Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const todayDate = startOfDay(new Date());

  // Filter logic processing based on Selection state
  const filteredBookings = bookings.filter(b => {
    if (eventTypeFilter === 'all') return true;
    return b.event_type === eventTypeFilter || (!b.event_type && eventTypeFilter === 'academic');
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-40 flex justify-between items-center bg-white/80 backdrop-blur-md">
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
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
              <div className="w-full md:w-auto">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-bold text-[10px] uppercase tracking-[0.4em] transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Halls
                </button>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 uppercase leading-tight">{hall.name}</h1>
              </div>

              {/* Feature 1 Layout: Interactive Toggles / Legend System */}
              <div className="flex flex-wrap gap-3 bg-white p-2 rounded-3xl border border-slate-200/80 shadow-sm w-full md:w-auto">
                <button 
                  onClick={() => setEventTypeFilter('all')} 
                  className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${eventTypeFilter === 'all' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  All events
                </button>
                <button 
                  onClick={() => setEventTypeFilter('academic')} 
                  className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${eventTypeFilter === 'academic' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-emerald-50'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${eventTypeFilter === 'academic' ? 'bg-white' : 'bg-emerald-500'}`} /> Academic
                </button>
                <button 
                  onClick={() => setEventTypeFilter('cultural')} 
                  className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${eventTypeFilter === 'cultural' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-purple-50'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${eventTypeFilter === 'cultural' ? 'bg-white' : 'bg-purple-500'}`} /> Cultural / Club
                </button>
              </div>
            </div>

            {/* Calendar Block Container */}
            <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-20">
              <div className="p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-50 bg-slate-50/20">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-[1.8rem] border border-slate-200 shadow-sm w-full md:w-auto justify-center">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-bold text-[10px] uppercase tracking-[0.3em]">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-2xl"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-l border-t border-slate-50">
                {calendarDays.map((day: Date, idx: number) => {
                  const dayBookings = filteredBookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-24 md:min-h-40 p-2 md:p-5 border-b border-r border-slate-50 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/10 cursor-not-allowed' : 'hover:bg-slate-50/50'}`}
                    >
                      <span className={`text-sm md:text-base font-bold w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl mb-3 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-800'}`}>{format(day, 'd')}</span>
                      
                      {/* Feature 1: Variable Color Code Badges dynamically chosen based on booking profiles */}
                      <div className="space-y-1.5 hidden md:block">
                        {dayBookings.slice(0, 2).map((b, bIdx) => {
                          const isAcademic = !b.event_type || b.event_type === 'academic';
                          return (
                            <div 
                              key={bIdx} 
                              className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase truncate border ${isAcademic ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}
                            >
                              {b.event_name}
                            </div>
                          )
                        })}
                        {dayBookings.length > 2 && (
                          <div className="text-[8px] font-bold text-slate-400 pl-1">+{dayBookings.length - 2} more</div>
                        )}
                      </div>
                      {dayBookings.length > 0 && <div className="md:hidden w-1.5 h-1.5 rounded-full bg-slate-700 mx-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Booking Submission Intake Layout Screen */
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); setErrorMsg(null); }} className="flex items-center gap-3 text-slate-400 hover:text-emerald-600 mb-10 font-bold text-[10px] uppercase tracking-[0.4em] transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Return to Calendar
             </button>
             <div className="bg-white rounded-4xl md:rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 md:p-16 text-white relative">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase mb-2 leading-none">{hall.name}</h2>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">Request for {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</p>
                </div>
                <div className="p-8 md:p-20">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Host Full Name</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="w-full py-2 font-bold text-xl outline-none bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Academic Email</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Department" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Department</label>
                      </div>
                      <div className="relative border-b-2 border-slate-200 pb-2 focus-within:border-emerald-500 transition-colors">
                        <input type="text" placeholder="Event Name" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full py-2 font-bold text-xl outline-none uppercase bg-transparent text-slate-900 placeholder-slate-300" />
                        <label className="absolute left-0 -top-6 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Event Title</label>
                      </div>

                      {/* Feature 1 Form Selector: Choose Category track */}
                      <div className="col-span-full space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Event Category classification</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, eventType: 'academic'})}
                            className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-center border-2 transition-all ${formData.eventType === 'academic' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                          >
                            Academic Event
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, eventType: 'cultural'})}
                            className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-center border-2 transition-all ${formData.eventType === 'cultural' ? 'border-purple-500 bg-purple-50/50 text-purple-900' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                          >
                            Cultural / Club Event
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input 
                          type="time" min="07:30" max="16:30" value={formData.startTime} 
                          onChange={e => setFormData({...formData, startTime: e.target.value})} 
                          className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg outline-none border border-slate-200 text-slate-900" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Time</label>
                        <input 
                          type="time" min="07:30" max="16:30" value={formData.endTime} 
                          onChange={e => setFormData({...formData, endTime: e.target.value})} 
                          className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-lg outline-none border border-slate-200 text-slate-900" 
                        />
                      </div>
                      
                      <div className="col-span-full mt-10 space-y-6">
                        {errorMsg && (
                          <div className="p-5 bg-rose-50 border border-rose-200 rounded-4xl flex items-center gap-4 animate-in fade-in">
                            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"><AlertCircle className="text-white w-5 h-5" /></div>
                            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">{errorMsg}</p>
                          </div>
                        )}
                        <button onClick={handleSendOTP} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-[12px] uppercase tracking-[0.4em] shadow-2xl transition-all">
                          {loading ? 'Validating Schedule...' : 'Confirm Booking'}
                        </button>
                      </div>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-12 py-8">
                        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.4em] mb-4">Enter Code</p><input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-4xl font-bold tracking-[0.5em] border-b-2 border-emerald-500 outline-none text-slate-900 pb-6 bg-transparent" /></div>
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold uppercase text-[10px] tracking-[0.4em] transition-all">Verify & Complete</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Feature 3: Split hourly timeline view inside individual daily info modal */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white relative">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-400 mb-1">Daily Agenda & Availability</p>
                <h3 className="text-2xl font-bold tracking-tighter uppercase leading-none">{format(selectedDate, 'MMM do, yyyy')}</h3>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Feature 3 Sub-component: Visual Session Timeline Breakdown */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Session Availability</h4>
                <div className="grid grid-cols-1 gap-3">
                  {timeSlots.map((slot, sIdx) => {
                    const activeConflicts = bookings.filter((b: Booking) => {
                      return b.booking_date && 
                             isSameDay(new Date(b.booking_date), selectedDate) &&
                             b.start_time < `${slot.end}:00` && 
                             b.end_time > `${slot.start}:00`;
                    });
                    const isOccupied = activeConflicts.length > 0;

                    return (
                      <div 
                        key={sIdx} 
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isOccupied ? 'bg-rose-50/50 border-rose-100 text-rose-900' : 'bg-emerald-50/40 border-emerald-100 text-emerald-900'}`}
                      >
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider">{slot.label}</p>
                          <p className="text-[10px] opacity-70 font-semibold">{formatTo12Hr(slot.start)} - {formatTo12Hr(slot.end)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            {isOccupied ? `Reserved (${activeConflicts[0].event_name})` : 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Comprehensive Day Log Stack */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Scheduled Events Log</h4>
                <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1 custom-scrollbar">
                  {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).map((b: Booking, i: number) => {
                    const isAcademic = !b.event_type || b.event_type === 'academic';
                    return (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="max-w-[60%]">
                          <p className="text-xs font-bold text-slate-900 uppercase truncate">{b.event_name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{b.department}</p>
                        </div>
                        <span className={`px-2.5 py-1.5 rounded-xl text-[8px] font-bold whitespace-nowrap border ${isAcademic ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                          {formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}
                        </span>
                      </div>
                    );
                  })}
                  {bookings.filter((b: Booking) => b.booking_date && isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl"><p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">No Bookings Set For Today</p></div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} 
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold text-[10px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
              >
                <Plus className="w-4 h-4" /> Initialize Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}