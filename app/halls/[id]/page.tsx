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
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, X, Plus
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
    fullName: '', email: '', dept: '', eventName: '', startTime: '', endTime: ''
  });

  const formatTo12Hr = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    async function fetchData() {
      const { data: hallData } = await supabase.from('halls').select('*').eq('id', id).single();
      if (hallData) setHall(hallData);

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('hall_id', id)
        .order('start_time', { ascending: true });
      
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName || !formData.dept) return alert("Fill all fields.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email.toLowerCase(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email.toLowerCase(), token: otpCode, type: 'email' 
    });
    if (otpError) { setLoading(false); alert("Invalid Code"); return; }

    const { error: bookingError } = await supabase.from('bookings').insert([{
      hall_id: id, event_name: formData.eventName, booking_date: format(selectedDate!, 'yyyy-MM-dd'),
      start_time: formData.startTime, end_time: formData.endTime, user_name: formData.fullName,
      user_email: formData.email.toLowerCase(), email: formData.email.toLowerCase(), department: formData.dept, status: 'Confirmed'
    }]);

    setLoading(false);
    if (!bookingError) setIsSuccess(true);
  };

  if (!hall) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black uppercase tracking-[0.3em] text-slate-300">Loading...</div>;

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 py-6 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        {!isRegistering ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-black text-[10px] uppercase tracking-widest transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> Back to Halls
                </button>
                <h1 className="text-3xl md:text-5xl font-light tracking-[0.25em] text-slate-900 uppercase italic leading-none">{hall.name}</h1>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest">Available</span></div>
                <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div><span className="text-[9px] font-black uppercase text-rose-700 tracking-widest">Reserved</span></div>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-16">
              <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-100 bg-slate-50/30">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-[0.1em]">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-[1.2rem] border border-slate-200 shadow-sm">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-l border-t border-slate-100">
                {calendarDays.map((day, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.booking_date), day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, todayDate) && !isToday;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-[150px] p-5 border-b border-r border-slate-100 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/30' : 'hover:bg-emerald-50/20'}`}
                    >
                      {isCurrentMonth && !isPast && (
                        <div className={`absolute top-4 right-4 transition-all ${dayBookings.length === 0 ? 'text-emerald-300' : 'text-slate-200'}`}>
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                      
                      <span className={`text-lg font-black w-9 h-9 flex items-center justify-center rounded-xl mb-4 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-900 group-hover:text-emerald-600'}`}>{format(day, 'd')}</span>
                      
                      {/* NEW MULTI-SLOT TAG */}
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                                <span className="text-[8px] font-black uppercase text-rose-600 tracking-tighter">
                                    {dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}
                                </span>
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="max-w-xl mx-auto text-center">
              <div className="bg-white rounded-[2rem] p-10 border-2 border-emerald-500 shadow-xl shadow-emerald-500/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-8 italic">Instructions</h4>
                <ul className="space-y-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest inline-block text-left">
                  <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Select a free slot</li>
                  <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Register with your details</li>
                  <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirm booking</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* REGISTRATION FORM (REMAINS SAME AS PREVIOUS) */
          <div className="max-w-4xl mx-auto py-10 text-center font-black uppercase text-slate-400 italic">Registration UI Loading...</div>
        )}
      </div>

      {/* AGENDA POPUP */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Daily Agenda</p><h3 className="text-xl font-light tracking-widest uppercase">{format(selectedDate, 'MMM do')}</h3></div>
              <button onClick={() => setIsPopupOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-3 mb-8">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div><p className="text-xs font-black text-slate-900 uppercase italic mb-0.5">{b.event_name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{b.department}</p></div>
                      <div className="text-[9px] font-black text-emerald-600 bg-white px-2.5 py-1 rounded-md border border-slate-100">{formatTo12Hr(b.start_time)} - {formatTo12Hr(b.end_time)}</div>
                    </div>
                ))}
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length === 0 && (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Events Scheduled</p></div>
                )}
              </div>
              <button onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}