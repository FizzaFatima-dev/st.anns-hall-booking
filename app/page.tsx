'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Building2, Users, Wifi, ArrowRight, 
  Calendar, Mail, MapPin, Zap
} from 'lucide-react';

// --- SKELETON COMPONENT ---
const HallSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden p-8 space-y-6 animate-pulse shadow-sm">
    <div className="h-56 bg-slate-100 rounded-3xl w-full" />
    <div className="space-y-3">
        <div className="h-6 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-50 rounded w-1/2" />
    </div>
    <div className="h-14 bg-slate-100 rounded-2xl w-full" />
  </div>
);

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    async function fetchHalls() {
      const { data } = await supabase.from('halls').select('*');
      if (data) {
        const updatedHalls = data.map(hall => {
          // Update Capacities as requested
          if (hall.name.includes("Seminar")) return { ...hall, capacity: 200 };
          if (hall.name.includes("Auditorium")) return { ...hall, capacity: 800 };
          return hall;
        });
        setHalls(updatedHalls);
      }
      setLoading(false);
    }
    fetchHalls();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAvailability = () => {
    document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to map the correct local image to the hall name
  const getHallImage = (name: string) => {
    if (name.includes("Seminar Hall 1")) return "/seminar hall 1.jpeg";
    if (name.includes("Seminar Hall 2")) return "/Seminar hall 2.jpeg";
    if (name.includes("Auditorium")) return "/Auditorium.jpeg";
    return "/Auditorium.jpeg"; // Fallback
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 transition-all duration-500 ${isScrolled ? 'bg-white md:bg-white/80 md:backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={scrollToTop}>
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase italic transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>St. Ann's <span className="text-emerald-400">Halls</span></span>
        </div>
        <div className={`hidden md:flex gap-10 font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${isScrolled ? 'text-slate-500' : 'text-white/80'}`}>
          <button onClick={scrollToTop} className="hover:text-emerald-500 transition-colors cursor-pointer">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-500 transition-colors cursor-pointer">Availability</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[95vh] w-full flex items-center px-6 md:px-10 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/Auditorium.jpeg')` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/90 md:via-slate-900/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/40 z-0" />
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center pt-20">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Official Portal
            </div>
            <h1 className="text-5xl md:text-8xl font-light text-white leading-[0.9] tracking-tight mb-8 uppercase italic">
              Book Your <br />
              <span className="text-emerald-400 font-black">Campus Space</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-md font-medium leading-relaxed opacity-90">
              A premium, streamlined reservation system for St. Ann's premier venues. Secure your department's next event in a few clicks.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-2xl shadow-emerald-600/30 group active:scale-95 cursor-pointer"
            >
              Explore Halls <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="hidden lg:block space-y-6">
            {halls.slice(0, 3).map((hall, i) => (
              <div 
                key={hall.id} 
                style={{ animationDelay: `${i * 200}ms` }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex justify-between items-center hover:bg-white/10 hover:border-emerald-500/50 transition-all animate-float shadow-2xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{hall.name}</h3>
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">{hall.capacity} Capacity</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Live Status
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-20 md:py-32 px-6 md:px-10 bg-[#FBFBFE]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.6em] mb-4 block">Venue Directory</span>
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight mb-8 uppercase italic leading-none">Hall Availability</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-10" />
            <p className="text-slate-500 max-w-xl mx-auto text-[10px] font-black uppercase tracking-[0.3em] leading-loose">
              High-capacity spaces designed for impactful learning, cultural events, and academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
                  className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 md:hover:-translate-y-3"
                >
                  <div className="h-64 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={getHallImage(hall.name)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                      alt={hall.name}
                    />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      View Schedule
                    </div>
                  </div>

                  <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-light text-slate-900 mb-6 md:mb-8 tracking-tighter uppercase italic group-hover:text-emerald-600 transition-colors">
                      {hall.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-8 md:mb-10">
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 uppercase tracking-[0.2em]">
                        <Users className="w-4 h-4 text-emerald-500" /> {hall.capacity} Seats
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 uppercase tracking-[0.2em]">
                        <Wifi className="w-4 h-4 text-emerald-500" /> Gigabit WiFi
                      </div>
                    </div>
                    <Link 
                      href={`/halls/${hall.id}`} 
                      className="flex justify-center items-center gap-4 w-full py-6 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-200 active:scale-95"
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 md:py-24 px-6 md:px-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative z-10">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                <img 
                  src="/favicon.ico" 
                  alt="College Logo" 
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <span className="text-3xl font-black tracking-tighter italic uppercase">St. Ann's</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-loose">
              The official venue coordination platform for academic and cultural events.
            </p>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-6 md:mb-8 text-emerald-400">Navigation</h4>
            <ul className="space-y-4 md:space-y-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <li><button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors cursor-pointer text-left">Home Page</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Availability</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-6 md:mb-8 text-emerald-400">Venues</h4>
            <ul className="space-y-4 md:space-y-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {halls.map(hall => (
                <li key={hall.id}>
                  <Link href={`/halls/${hall.id}`} className="hover:text-emerald-400 transition-colors italic">
                    {hall.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-6 md:mb-8 text-emerald-400">Contact</h4>
            <ul className="space-y-4 md:space-y-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <li>
                <a href="mailto:info@stannscollegehyd.com" className="flex items-center gap-4 hover:text-emerald-400 transition-colors group">
                  <Mail className="w-4 h-4 text-emerald-400" /> info@stannscollegehyd.com
                </a>
              </li>
              <li>
                <a 
                  href="https://maps.app.goo.gl/QywgPRuXyzsR-SLbsaAs1iw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-4 hover:text-emerald-400 transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" /> 
                  Mehdipatnam, Hyderabad
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 text-center md:text-left">
          <p>© 2026 St. Ann's College Booking Portal</p>
          <div className="flex gap-8 italic">
            <span className="text-emerald-400/50">Direct</span>
            <span className="text-emerald-400/50">Digital</span>
            <span className="text-emerald-400/50">Departmental</span>
          </div>
        </div>
      </footer>
    </div>
  );
}