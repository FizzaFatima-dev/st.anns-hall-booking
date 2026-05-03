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
  CheckCircle2, Clock, ArrowLeft, ShieldCheck, X, Plus, Sparkles
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
    if (!formData.email || !formData.fullName || !formData.dept) return alert("Please fill in all required fields.");
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden text-center">
          <div className="bg-emerald-600 p-12 text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12" /></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Confirmed!</h2>
          </div>
          <div className="p-10"><button onClick={() => router.push('/')} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest">Return Home</button></div>
        </div>
      </div>
    );
  }

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
                        <div className="absolute top-4 right-4 text-emerald-400 opacity-100 transition-all group-hover:rotate-90">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                      
                      <span className={`text-lg font-black w-9 h-9 flex items-center justify-center rounded-xl mb-4 transition-all ${isToday ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-900 group-hover:text-emerald-600'}`}>{format(day, 'd')}</span>
                      
                      {dayBookings.length > 0 && isCurrentMonth && (
                        <div className="mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                <div className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                                <span className="text-[8px] font-black uppercase text-rose-600 tracking-tighter">{dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}</span>
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
          /* REGISTRATION FORM - RESTORED */
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> Back to Calendar
             </button>
             <div className="bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-10 text-white">
                  <h2 className="text-3xl font-light tracking-widest uppercase italic">{hall.name}</h2>
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Registration for {format(selectedDate!, 'MMMM do')}</p>
                </div>
                <div className="p-12">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="relative group"><input type="text" placeholder=" " value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="peer w-full border-b border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500 uppercase bg-transparent" /><label className="absolute left-0 top-3 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-4">Full Name</label></div>
                      <div className="relative group"><input type="email" placeholder=" " value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} className="peer w-full border-b border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500 bg-transparent" /><label className="absolute left-0 top-3 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-4">Email Address</label></div>
                      <div className="relative group"><input type="text" placeholder=" " value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="peer w-full border-b border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500 uppercase bg-transparent" /><label className="absolute left-0 top-3 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-4">Department</label></div>
                      <div className="relative group"><input type="text" placeholder=" " value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="peer w-full border-b border-slate-200 py-3 font-bold text-lg outline-none focus:border-emerald-500 uppercase bg-transparent" /><label className="absolute left-0 top-3 text-slate-400 font-black text-[9px] uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:-top-4">Event Name</label></div>
                      <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time</label><input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border-b border-slate-200 py-2 font-bold text-lg outline-none focus:border-emerald-500" /></div>
                      <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Time</label><input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border-b border-slate-200 py-2 font-bold text-lg outline-none focus:border-emerald-500" /></div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all">{loading ? 'Processing...' : 'Verify Email'}</button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-10 py-10">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enter 6-digit Code</p>
                        <input type="text" maxLength={6} placeholder="000000" autoFocus value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-5xl font-black tracking-[0.3em] border-b-2 border-emerald-500 outline-none text-slate-900 pb-4 bg-transparent" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">Confirm Booking</button>
                    </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* POPUP REMAINS SAME */}
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