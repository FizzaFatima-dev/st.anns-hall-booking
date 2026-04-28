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
  CheckCircle2, Clock, ArrowLeft, User, ShieldCheck, Sparkles, Mail, MapPin, X
} from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState<any>(null);
  const [allHalls, setAllHalls] = useState<any[]>([]);
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
      const { data: allHallsData } = await supabase.from('halls').select('*');
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('hall_id', id);
      
      setHall(hallData);
      if (allHallsData) setAllHalls(allHallsData);
      if (bookingData) setBookings(bookingData);
    }
    fetchData();
  }, [id]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAvailability = () => {
    setIsRegistering(false);
    setIsPopupOpen(false);
    setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName || !formData.dept) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else setIsVerifying(true);
  };

  const handleVerifyAndBook = async () => {
    if (!otpCode) return alert("Please enter the code.");
    setLoading(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: 'signup'
    });

    if (otpError) {
      setLoading(false);
      alert("Invalid Code.");
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

  if (!hall) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-emerald-500 uppercase tracking-widest">Loading...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Confirmed!</h2>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">Finish</button>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const todayDate = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg"><Building2 className="text-white w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">St. Ann's</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        {isRegistering && selectedDate ? (
           <div className="max-w-4xl mx-auto">
             <button onClick={() => { setIsRegistering(false); setIsVerifying(false); }} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-6 font-black text-[10px] uppercase tracking-widest transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
             </button>
             <div className="bg-white rounded-4xl md:rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center"><Building2 className="text-emerald-400 w-6 h-6 md:w-7 md:h-7" /></div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic">{hall.name}</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Registration</p>
                      </div>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 w-full md:w-auto justify-center text-sm">
                      <LucideCalendar className="w-5 h-5 text-emerald-400" />
                      <span className="font-black uppercase">{format(selectedDate, 'EEEE, MMMM do')}</span>
                    </div>
                </div>
                <div className="p-6 md:p-12">
                   {!isVerifying ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <input type="text" placeholder="FULL NAME *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase text-slate-900 w-full" />
                      <input type="email" placeholder="EMAIL ADDRESS *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 text-slate-900 w-full" />
                      <input type="text" placeholder="DEPARTMENT *" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase text-slate-900 w-full" />
                      <input type="text" placeholder="EVENT NAME *" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base outline-none focus:border-emerald-500 uppercase text-slate-900 w-full" />
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base w-full outline-none focus:border-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="border-b-2 border-slate-300 py-4 font-bold text-base w-full outline-none focus:border-emerald-500" />
                      </div>
                      <button onClick={handleSendOTP} disabled={loading} className="col-span-full mt-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                      </button>
                    </div>
                   ) : (
                    <div className="max-w-md mx-auto text-center space-y-8">
                        <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                        <div>
                          <h3 className="text-xl font-black uppercase italic text-slate-900">Verify Email</h3>
                          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Code sent to {formData.email}</p>
                        </div>
                        <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-4xl font-black tracking-widest border-b-4 border-emerald-500 outline-none text-slate-900" />
                        <button onClick={handleVerifyAndBook} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Confirm Booking</button>
                    </div>
                   )}
                </div>
             </div>
           </div>
        ) : (
          <>
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Halls
            </button>

            <div className="flex items-center gap-4 mb-2 ml-1">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Available</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Booked</span></div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-10 leading-none uppercase italic">{hall.name}</h1>

            <div className="bg-white rounded-4xl md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
              <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-50">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-800 uppercase italic">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 bg-white text-slate-900 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-widest">Today</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
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
                    <div 
                      key={idx} 
                      onClick={() => { if (isCurrentMonth && !isPast) { setSelectedDate(day); setIsPopupOpen(true); } }}
                      className={`min-h-[140px] md:min-h-[180px] p-4 border-b border-r border-slate-50 transition-all group relative cursor-pointer ${!isCurrentMonth || isPast ? 'opacity-20 bg-slate-50/50 cursor-not-allowed' : 'hover:bg-emerald-50/30'}`}
                    >
                      <span className={`text-base font-black w-8 h-8 flex items-center justify-center rounded-full mb-3 ${isToday ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                      <div className="flex flex-wrap gap-1">
                        {dayBookings.map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm"></div>
                        ))}
                      </div>
                      {isCurrentMonth && !isPast && (
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">View Details</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 text-center mb-12">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 rounded-full mb-6">
                   <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Instructions</span>
                </div>
               <ul className="text-left space-y-4 max-w-xs mx-auto">
                    <li className="flex gap-4 items-start">
                      <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm shrink-0">1</span>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight leading-tight">Click a date to see existing event timings.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm shrink-0">2</span>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight leading-tight">Fill in your event details and preferred time.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm shrink-0">3</span>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight leading-tight">Verify email to secure your booking.</p>
                    </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* DAILY AGENDA POPUP */}
      {isPopupOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight">Daily Agenda</h3>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{format(selectedDate, 'EEEE, MMMM do')}</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8">
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-8 pr-2">
                {bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).length > 0 ? (
                  bookings.filter(b => isSameDay(new Date(b.booking_date), selectedDate)).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase italic">{b.event_name}</p>
                        <p className="text-[9px] font-bold text-rose-500 uppercase">{b.department}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-600 bg-white px-2 py-1 rounded-lg border border-rose-100 shadow-sm">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black">{b.start_time} - {b.end_time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No events scheduled</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsPopupOpen(false); setIsRegistering(true); }}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Book New Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#059669] text-white py-10 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="text-[#059669] w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter italic uppercase">St. Ann's</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-white/50">Navigation</h4>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-wide">
              <li><button onClick={scrollToTop} className="hover:text-emerald-200 transition-colors">Home</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-emerald-200 transition-colors text-left">Availability</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-white/50">Campus Spaces</h4>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-wide">
              {allHalls.map(h => <li key={h.id} className="text-emerald-50 italic">{h.name}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-white/50">Contact Office</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-wide">
              <li><a href="mailto:info@stannscollegehyd.com" className="flex items-center gap-2 text-emerald-50 hover:text-white transition-colors"><Mail className="w-3.5 h-3.5 text-emerald-200" /> info@stannscollegehyd.com</a></li>
              <li><a href="#" className="flex items-center gap-2 text-emerald-50 hover:text-white transition-colors"><MapPin className="w-3.5 h-3.5 text-emerald-200" /> Mehdipatnam, Hyd</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200/60">
          <p>© 2026 St. Ann's College Booking Portal</p>
          <p className="hidden md:block italic">Direct. Digital. Departmental.</p>
        </div>
      </footer>
    </div>
  );
}