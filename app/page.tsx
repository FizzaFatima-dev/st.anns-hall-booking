'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Building2, Users, Wifi, CheckCircle2, ArrowRight, 
  Calendar, Mail, MapPin, Sparkles, Zap 
} from 'lucide-react';

// --- SKELETON COMPONENT FOR LOADING ---
const HallSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden p-8 space-y-4 animate-pulse">
    <div className="h-44 bg-slate-200 rounded-2xl w-full" />
    <div className="h-6 bg-slate-200 rounded w-3/4" />
    <div className="flex gap-2">
      <div className="h-8 bg-slate-100 rounded-lg w-20" />
      <div className="h-8 bg-slate-100 rounded-lg w-20" />
    </div>
    <div className="h-14 bg-slate-200 rounded-2xl w-full" />
  </div>
);

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHalls() {
      const { data } = await supabase.from('halls').select('*');
      if (data) {
        // Map the new capacities manually if not updated in DB yet
        const updatedHalls = data.map(hall => {
          if (hall.name.includes("Seminar")) return { ...hall, capacity: 100 };
          if (hall.name.includes("Auditorium")) return { ...hall, capacity: 1200 };
          return hall;
        });
        setHalls(updatedHalls);
      }
      setLoading(false);
    }
    fetchHalls();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAvailability = () => {
    document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation */}
      <nav id="top-section" className="absolute top-0 w-full z-30 flex justify-between items-center px-10 py-8">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={scrollToTop}>
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">St. Ann's <span className="text-emerald-400">Halls</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-white/80 font-black text-[10px] uppercase tracking-[0.2em]">
          <button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-400 transition-colors">Availability</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex items-center px-10 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] scale-110 animate-slow-zoom"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2070&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              St. Ann's Official Portal
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6 uppercase italic">
              Book Your <br />
              <span className="text-emerald-400">Campus Space</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-md font-medium leading-relaxed opacity-90">
              Check real-time availability of St. Ann's premier venues. Secure your slot for departmental events in seconds.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl shadow-emerald-500/40 group active:scale-95"
            >
              Explore Halls <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Info Cards on Hero */}
          <div className="hidden lg:block space-y-4">
            {halls.slice(0, 3).map((hall, i) => (
              <div 
                key={hall.id} 
                style={{ animationDelay: `${i * 150}ms` }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex justify-between items-center hover:bg-white/10 hover:border-emerald-500/30 transition-all animate-in fade-in slide-in-from-right duration-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Zap className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase italic">{hall.name}</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{hall.capacity} Capacity</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-32 px-10 bg-[#FBFBFE]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.6em] mb-4">Venue Directory</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic">Hall Availability</h2>
            <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full mb-8" />
            <p className="text-slate-500 max-w-xl mx-auto text-base font-bold leading-relaxed uppercase text-[11px] tracking-widest">
              High-capacity spaces designed for impactful learning and cultural excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <>
                <HallSkeleton />
                <HallSkeleton />
                <HallSkeleton />
              </>
            ) : (
              halls.map((hall) => (
                <div 
                  key={hall.id} 
                  className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)] group hover:shadow-3xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={hall.name.includes("Auditorium") ? "https://images.unsplash.com/photo-1503418895522-46f9804cda40?q=80&w=2070" : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069"} 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                      alt={hall.name}
                    />
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      Ready to Book
                    </div>
                  </div>

                  <div className="p-10">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase italic group-hover:text-emerald-600 transition-colors">
                      {hall.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-12">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 uppercase tracking-widest">
                        <Users className="w-4 h-4 text-emerald-500" /> {hall.capacity} Seats
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 uppercase tracking-widest">
                        <Wifi className="w-4 h-4 text-emerald-500" /> Gigabit WiFi
                      </div>
                    </div>
                    <Link 
                      href={`/halls/${hall.id}`} 
                      className="flex justify-center items-center gap-3 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-emerald-500 transition-all shadow-2xl shadow-slate-200 hover:shadow-emerald-200 active:scale-95"
                    >
                      <Calendar className="w-4 h-4" /> Open Calendar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer stays consistent with your current branding */}
      <footer className="bg-emerald-600 text-white py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="text-emerald-600 w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter italic uppercase">St. Ann's</span>
            </div>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest leading-loose opacity-70">
              The premier destination for academic and cultural excellence at St. Ann's College for Women.
            </p>
          </div>

          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] mb-6 text-emerald-300">Navigation</h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li><button onClick={scrollToTop} className="hover:text-white text-emerald-50 transition-colors">Home</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-white text-emerald-50 transition-colors text-left">Availability</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] mb-6 text-emerald-300">Quick Links</h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              {halls.map(hall => (
                <li key={hall.id}>
                  <Link href={`/halls/${hall.id}`} className="text-emerald-50 hover:text-white transition-colors italic">
                    {hall.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] mb-6 text-emerald-300">Contact Office</h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li>
                <a href="mailto:info@stannscollegehyd.com" className="flex items-center gap-3 text-emerald-50 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-emerald-300" /> 
                  info@stannscollegehyd.com
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 text-emerald-50 hover:text-white transition-colors group">
                  <MapPin className="w-4 h-4 text-emerald-300" /> 
                  Mehdipatnam, Hyd
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200/60 text-center">
          <p>© 2026 St. Ann's College Booking Portal</p>
          <p className="italic">Direct. Digital. Departmental.</p>
        </div>
      </footer>
    </div>
  );
}