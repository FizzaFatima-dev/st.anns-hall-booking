'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Building2, Users, Wifi, CheckCircle2, ArrowRight, Calendar, Mail, MapPin, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHalls() {
      const { data } = await supabase.from('halls').select('*');
      if (data) setHalls(data);
    }
    fetchHalls();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAvailability = () => document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#020617] font-sans antialiased text-slate-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-6 md:px-10 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Building2 className="text-slate-950 w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            St. Ann's <span className="text-emerald-500">Halls</span>
          </span>
        </div>
        <div className="hidden md:flex gap-10 text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">
          <button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-400 transition-colors">Availability</button>
          <button className="px-5 py-2 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all">Admin Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen w-full flex items-center px-6 md:px-10 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-16 items-center pt-20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3 fill-emerald-400" />
              Centralized Booking System
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1] tracking-tight mb-8 uppercase">
              Elite Spaces For <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Brilliant Minds.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg font-medium leading-relaxed">
              The official St. Ann's digital gateway for reserving premium seminar halls and auditoriums. Designed for efficiency, built for the department.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToAvailability}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-95"
              >
                View Availability <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 px-6 py-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verified Faculty Access</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
             <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] -z-10" />
             <div className="space-y-4">
              {halls.map((hall, idx) => (
                <div key={hall.id} 
                  className="group bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex justify-between items-center hover:border-emerald-500/40 transition-all duration-500"
                  style={{ marginLeft: `${idx * 20}px` }}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Building2 className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight italic uppercase">{hall.name}</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> {hall.capacity} Capacity
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hall Availability Section */}
      <section id="availability-section" className="py-32 px-6 md:px-10 bg-[#020617] relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.4em] mb-4">Venue Directory</p>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Premium Campus Halls</h2>
            </div>
            <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed border-l-2 border-emerald-500/30 pl-6">
              Real-time synchronization with college events schedule. Select a venue to proceed with formal booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {halls.map((hall) => (
              <div key={hall.id} className="group bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    alt={hall.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-80" />
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/50 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Instantly Available
                  </div>
                </div>

                <div className="p-8 -mt-10 relative z-20">
                  <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase italic group-hover:text-emerald-400 transition-colors">{hall.name}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> {hall.capacity} SEATS
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" /> GIGABIT WIFI
                    </div>
                  </div>
                  <Link 
                    href={`/halls/${hall.id}`} 
                    className="flex justify-center items-center gap-3 w-full py-4 bg-emerald-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-[0.98]"
                  >
                    <Calendar className="w-4 h-4" /> Book This Venue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="text-slate-950 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter italic uppercase text-white">St. Ann's</span>
            </div>
            <p className="text-slate-500 text-xs font-medium leading-loose">
              Setting the standard for departmental coordination and event management within St. Ann's campus.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-6 text-emerald-500">Navigation</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><button onClick={scrollToTop} className="hover:text-white transition-colors">Return to Top</button></li>
              <li><button onClick={scrollToAvailability} className="hover:text-white transition-colors text-left">Browse Availability</button></li>
              <li><button className="hover:text-white transition-colors">Faculty Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-6 text-emerald-500">Campus Venues</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {halls.map(hall => (
                <li key={hall.id} className="hover:text-white cursor-default transition-colors">{hall.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-6 text-emerald-500">Support</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
              <li>
                <a href="mailto:info@stannscollegehyd.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-emerald-500" /> info@stannscollegehyd.com
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Mehdipatnam, Hyderabad
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          <p>© 2026 St. Ann's College Digital Ecosystem</p>
          <p className="italic text-emerald-500/50">Efficiency. Excellence. Innovation.</p>
        </div>
      </footer>
    </div>
  );
}