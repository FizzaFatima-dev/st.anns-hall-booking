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
      <header className="relative min-h-[90vh] w-full flex items-center px-6 md:px-10 overflow-hidden bg-slate-900 py-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105 animate-slow-zoom"
          style={{ backgroundImage: `url('https://i.ytimg.com/vi/6PSL5bKVzOs/maxresdefault.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-8 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Official Booking Portal
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6 uppercase">
              Book Your <br />
              <span className="text-emerald-400">Campus Space</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-md font-medium leading-relaxed opacity-70 border-l border-emerald-500/30 pl-6">
              Experience seamless venue reservation. Designed for efficiency, built for excellence.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] group active:scale-95 cursor-pointer"
            >
              Explore Halls <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="hidden lg:block space-y-4">
            {halls.slice(0, 3).map((hall, i) => (
              <Link 
                key={hall.id} 
                href={`/halls/${hall.id}`}
                style={{ animationDelay: `${(i + 1) * 200}ms` }}
                className="group/card bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.06] hover:border-emerald-500/40 transition-all duration-500 block animate-in fade-in slide-in-from-right-10 fill-mode-both"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover/card:bg-emerald-500 group-hover/card:text-slate-950 transition-all">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight uppercase group-hover/card:text-emerald-400 transition-colors">
                      {hall.name}
                    </h3>
                    <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{hall.capacity} Capacity</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover/card:text-emerald-400 group-hover/card:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-24 md:py-32 px-6 md:px-10 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
                <span className="text-emerald-600 font-black text-[12px] uppercase tracking-[0.5em] mb-4 block">Selection</span>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-6">Hall Availability</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed opacity-70">
                  Select a venue to view its real-time schedule and technical specifications.
                </p>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Total Venues</p>
                <p className="text-4xl font-black text-emerald-500">{halls.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <><HallSkeleton /><HallSkeleton /><HallSkeleton /></>
            ) : (
              halls.map((hall) => (
                <div 
                  key={hall.id} 
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 md:hover:-translate-y-2 flex flex-col border border-slate-100"
                >
                  <div className="h-72 bg-slate-200 relative overflow-hidden">
                    <img src={getHallImage(hall.name)} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt={hall.name} />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase group-hover:text-emerald-600 transition-colors">
                      {hall.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{hall.capacity} Seats</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Wifi className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Gigabit</span>
                      </div>
                    </div>
                    <Link href={`/halls/${hall.id}`} className="mt-auto flex justify-center items-center gap-4 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95">
                      <Calendar className="w-4 h-4" /> Open Calendar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-20 px-6 md:px-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5">
                <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">ST. ANN'S</span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] leading-loose">
              Official venue coordination platform for academic and cultural excellence at St. Ann's College.
            </p>
          </div>
          
          <div className="md:ml-auto">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-8 text-emerald-500">Navigation</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <li><button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer">The Portal</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-white transition-colors cursor-pointer">Venues</button></li>
            </ul>
          </div>

          <div className="md:ml-auto">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-8 text-emerald-500">Directory</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {halls.map(hall => (
                <li key={hall.id}>
                  <Link href={`/halls/${hall.id}`} className="hover:text-white transition-colors">{hall.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:ml-auto">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-8 text-emerald-500">Contact</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <li>
                {/* FIXED MAIL LINK WITH HTTPS */}
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@stannscollegehyd.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-400 transition-colors group">
                  <Mail className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                  info@stannscollegehyd.com
                </a>
              </li>
              <li>
                {/* FIXED MAP LINK WITH HTTPS TO OFFICIAL COLLEGE LOCATION */}
                <a 
                  href="https://www.google.com/maps/place/St.+Ann's+College+for+Women/@17.393066,78.435646,15z" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 hover:text-emerald-400 transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                  Mehdipatnam, Hyderabad
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.5em] text-slate-600">
          <p>© 2026 ST. ANN'S COLLEGE — DIGITAL CORE</p>
          <div className="flex gap-8">
            <span>Precision</span>
            <span>Excellence</span>
            <span>Unity</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}