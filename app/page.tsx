'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Wifi, ArrowRight, 
  Calendar, Mail, MapPin, Zap,
  ChevronRight, Sparkles
} from 'lucide-react';

// --- SKELETON COMPONENT ---
const HallSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden p-8 space-y-6 animate-pulse shadow-sm">
    <div className="h-64 bg-slate-100 rounded-3xl w-full" />
    <div className="space-y-3">
        <div className="h-8 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-50 rounded w-1/2" />
    </div>
    <div className="h-16 bg-slate-100 rounded-2xl w-full" />
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
          let finalName = hall.name;
          let finalCapacity = hall.capacity;

          if (hall.name === "Seminar Hall 1") {
            finalName = "Gnanamma Hall";
            finalCapacity = 200;
          } else if (hall.name === "Seminar Hall 2") {
            finalName = "Deickmann Hall";
            finalCapacity = 200;
          } else if (hall.name.includes("Auditorium")) {
            finalName = "St. Joseph's Auditorium";
            finalCapacity = 800;
          }

          return { ...hall, name: finalName, capacity: finalCapacity };
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

  const getHallImage = (name: string) => {
    if (name === "Gnanamma Hall") return "/seminar hall 1.jpeg";
    if (name === "Deickmann Hall") return "/Seminar hall 2.jpeg";
    if (name === "St. Joseph's Auditorium") return "/Auditorium.jpeg";
    return "/Auditorium.jpeg"; 
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-5 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-4' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={scrollToTop}>
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden group-hover:rotate-6 transition-transform duration-300">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>ST. ANN'S <span className="text-emerald-500">HALLS</span></span>
        </div>
        <div className={`hidden md:flex gap-10 font-bold text-[11px] uppercase tracking-[0.3em] transition-colors ${isScrolled ? 'text-slate-500' : 'text-white/70'}`}>
          <button onClick={scrollToTop} className="hover:text-emerald-500 transition-colors cursor-pointer relative group">Home <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span></button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-500 transition-colors cursor-pointer relative group">Availability <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span></button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex items-center px-6 md:px-10 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105 animate-slow-zoom"
          style={{ backgroundImage: `url('https://i.ytimg.com/vi/6PSL5bKVzOs/maxresdefault.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center pt-10">
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-8 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Official Booking Portal
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase italic">
              Book Your <br />
              <span className="text-emerald-400 not-italic">Campus Space</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-md font-medium leading-relaxed opacity-80 border-l-2 border-emerald-500/30 pl-6">
              Experience seamless venue reservation. Designed for efficiency, built for excellence.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] group active:scale-95 cursor-pointer"
            >
              Explore Halls <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Connected Floating Cards with Staggered Animation */}
          <div className="hidden lg:block space-y-6">
            {halls.slice(0, 3).map((hall, i) => (
              <Link 
                key={hall.id} 
                href={`/halls/${hall.id}`}
                style={{ animationDelay: `${(i + 1) * 200}ms` }}
                className="group/card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] flex justify-between items-center hover:bg-white/[0.08] hover:border-emerald-500/40 transition-all duration-500 shadow-2xl cursor-pointer block animate-in fade-in slide-in-from-right-10 fill-mode-both"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover/card:scale-110 group-hover/card:bg-emerald-500 group-hover/card:text-slate-950 transition-all duration-500">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase group-hover/card:text-emerald-400 transition-colors">
                      {hall.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">{hall.capacity} Capacity</span>
                        <span className="w-1 h-1 bg-emerald-500/40 rounded-full"></span>
                        <span className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-[0.2em]">Verified</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/card:border-emerald-500/50 group-hover/card:bg-emerald-500/10 transition-all">
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover/card:text-emerald-400 group-hover/card:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-24 md:py-40 px-6 md:px-10 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
                <span className="text-emerald-600 font-black text-[12px] uppercase tracking-[0.5em] mb-4 block">Selection</span>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-6">Hall Availability</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed opacity-70">
                  Select a venue to view its real-time schedule and technical specifications.
                </p>
            </div>
            <div className="h-px flex-1 bg-slate-200 mx-10 hidden md:block mb-4"></div>
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Total Venues</p>
                <p className="text-4xl font-black text-emerald-500">{halls.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <><HallSkeleton /><HallSkeleton /><HallSkeleton /></>
            ) : (
              halls.map((hall) => (
                <div 
                  key={hall.id} 
                  className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] group hover:shadow-[0_40px_80px_rgba(16,185,129,0.15)] transition-all duration-700 md:hover:-translate-y-4 flex flex-col border border-slate-100"
                >
                  <div className="h-80 bg-slate-200 relative overflow-hidden">
                    <img src={getHallImage(hall.name)} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt={hall.name} />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                        Featured
                    </div>
                  </div>
                  <div className="p-10 flex flex-col flex-1">
                    <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter uppercase group-hover:text-emerald-600 transition-colors">
                      {hall.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                        <Users className="w-5 h-5 text-emerald-500 mb-2" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seats</span>
                        <span className="text-lg font-bold text-slate-900">{hall.capacity}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                        <Wifi className="w-5 h-5 text-emerald-500 mb-2" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tech</span>
                        <span className="text-lg font-bold text-slate-900">Gigabit</span>
                      </div>
                    </div>
                    <Link href={`/halls/${hall.id}`} className="mt-auto flex justify-center items-center gap-4 w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl active:scale-95">
                      <Calendar className="w-5 h-5" /> Open Calendar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-24 md:py-32 px-6 md:px-10 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden p-1.5">
                <img src="/favicon.ico" alt="College Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase">ST. ANN'S</span>
            </div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] leading-loose">
              Setting the standard for campus facility management. Professional, integrated, and efficient.
            </p>
          </div>
          <div className="md:ml-auto">
            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-emerald-500">Links</h4>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer text-left">The Portal</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-white transition-colors text-left cursor-pointer">Venues</button></li>
            </ul>
          </div>
          <div className="md:ml-auto">
            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-emerald-500">Directory</h4>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {halls.map(hall => (
                <li key={hall.id}>
                  <Link href={`/halls/${hall.id}`} className="hover:text-white transition-colors">{hall.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:ml-auto">
            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-emerald-500">Help</h4>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><a href="mailto:info@stannscollegehyd.com" className="hover:text-white transition-colors">Support Email</a></li>
              <li><span className="text-slate-600 cursor-not-allowed">Terms of Use</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
          <p>© 2026 ST. ANN'S COLLEGE — DIGITAL CORE</p>
          <div className="flex gap-10">
            <span className="hover:text-emerald-500 transition-colors cursor-default">Precision</span>
            <span className="hover:text-emerald-500 transition-colors cursor-default">Excellence</span>
            <span className="hover:text-emerald-500 transition-colors cursor-default">Unity</span>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}