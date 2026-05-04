'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Wifi, ArrowRight, 
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
      
      {/* Navigation - Fixed z-index and backdrop */}
      <nav className={`fixed top-0 w-full z-100 flex justify-between items-center px-6 md:px-12 py-5 transition-all duration-500 ${isScrolled ? 'bg-white shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={scrollToTop}>
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase italic transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>St. Ann's <span className="text-emerald-400">Halls</span></span>
        </div>
        <div className={`hidden md:flex gap-10 font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${isScrolled ? 'text-slate-500' : 'text-white/80'}`}>
          <button onClick={scrollToTop} className="hover:text-emerald-500 transition-colors cursor-pointer">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-500 transition-colors cursor-pointer">Availability</button>
        </div>
      </nav>

      {/* Hero Section - Fixed height and padding */}
      <header className="relative min-h-screen w-full flex items-center px-6 md:px-10 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://i.ytimg.com/vi/6PSL5bKVzOs/maxresdefault.jpg')` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/40 z-0" />
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-12 items-center pt-32 pb-20">
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex justify-between items-center hover:bg-white/10 hover:border-emerald-500/50 transition-all shadow-2xl"
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

      {/* Rest of the section: Availability, Footer, etc. stay the same */}
      <section id="availability-section" className="py-20 md:py-32 px-6 md:px-10 bg-[#FBFBFE]">
        {/* ... (rest of your component) */}
      </section>
    </div>
  );
}