'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Building2, Users, Wifi, CheckCircle2, ArrowRight, Calendar, Mail, MapPin } from 'lucide-react';

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHalls() {
      const { data } = await supabase.from('halls').select('*');
      if (data) setHalls(data);
    }
    fetchHalls();
  }, []);

  // Scroll to Top for Home Link
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAvailability = () => {
    document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900">
      {/* Navigation - St. Ann's Branding */}
      <nav id="top-section" className="absolute top-0 w-full z-30 flex justify-between items-center px-10 py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shadow-md shadow-emerald-200">
            <Building2 className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">St. Ann's <span className="text-emerald-400">Halls</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-white/80 font-bold text-[10px] uppercase tracking-[0.2em]">
          {/* Linked to top */}
          <button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors uppercase">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-400 transition-colors uppercase">Availability</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex items-center px-10 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2070&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              St. Ann's Official Portal
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-6 uppercase italic">
              Book Your <br />
              <span className="text-emerald-400">Campus Space</span>
            </h1>
            <p className="text-base text-slate-300 mb-8 max-w-md font-medium leading-relaxed opacity-80">
              Check real-time availability of St. Ann's seminar halls and auditorium. Secure your venue for departmental events in seconds.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-7 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/30 group"
            >
              Explore Halls <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="hidden lg:block space-y-3">
            {halls.map((hall) => (
              <div key={hall.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Building2 className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight uppercase italic">{hall.name}</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Capacity: {hall.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase border border-emerald-500/10">
                  Live
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-24 px-10 bg-[#FBFBFE]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.5em] mb-3">Campus Venues</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase italic">Hall Availability</h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 max-w-lg mx-auto text-sm font-medium leading-relaxed">
              Select the ideal location for your next workshop, seminar, or cultural event at St. Ann's.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {halls.map((hall) => (
              <div key={hall.id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] group hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    alt="hall"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                    <CheckCircle2 className="w-3 h-3" /> Ready to Book
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">{hall.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <Users className="w-3.5 h-3.5" /> {hall.capacity} Seats
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <Wifi className="w-3.5 h-3.5" /> High Speed WiFi
                    </div>
                  </div>
                  <Link 
                    href={`/halls/${hall.id}`} 
                    className="flex justify-center items-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#10B981] transition-all shadow-xl shadow-slate-100 hover:shadow-emerald-100 active:scale-95"
                  >
                    <Calendar className="w-4 h-4" /> Open Calendar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#059669] text-white py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Building2 className="text-[#059669] w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter italic uppercase">St. Ann's</span>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6">
              Modern digital infrastructure for efficient event management at St. Ann's College.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/70">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={scrollToTop} className="hover:text-emerald-200 transition-colors">Home</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-emerald-200 transition-colors text-left">View Availability</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/70">Campus Spaces</h4>
            <ul className="space-y-4 text-sm font-medium">
              {halls.map(hall => (
                <li key={hall.id} className="text-emerald-50 italic uppercase text-[11px] font-bold">{hall.name}</li>
              ))}
            </ul>
          </div>

          {/* CONTACT OFFICE WITH LINKS */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/70">Contact Office</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a href="mailto:info@stannscollegehyd.com" className="flex items-center gap-3 text-emerald-50 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" /> 
                  info@stannscollegehyd.com
                </a>
              </li>
              <li>
                <a 
                  href="https://www.google.com/maps?ll=17.39332,78.437838&z=15&t=m&hl=en&gl=IN&mapclient=embed&cid=3230818851375227641" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-emerald-50 hover:text-white transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" /> 
                  Mehdipatnam, Hyderabad
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
          <p>© 2026 St. Ann's College Booking Portal.</p>
        </div>
      </footer>
    </div>
  );
}