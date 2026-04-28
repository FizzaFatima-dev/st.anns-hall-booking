'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Users, Wifi, CheckCircle2, ArrowRight, Calendar, Mail, MapPin, User } from 'lucide-react';

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchHalls() {
      const { data } = await supabase.from('halls').select('*');
      if (data) setHalls(data);
    }
    fetchHalls();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAvailability = () => {
    document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-emerald-100">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900">ST. ANN'S <span className="text-emerald-600 italic">PORTAL</span></span>
        </div>
        <div className="hidden md:flex gap-10">
          <button onClick={scrollToTop} className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Home</button>
          <button onClick={scrollToAvailability} className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Availability</button>
        </div>
      </nav>

      {/* Hero Section - Refined Glassmorphism */}
      <header className="relative h-screen w-full flex items-center px-10 pt-20 overflow-hidden bg-slate-950">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2070&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl mx-auto gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Direct Campus Booking
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
              Reserve Your <br />
              <span className="text-emerald-500 italic">Academic Space</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-md font-medium leading-relaxed">
              The official centralized platform for St. Ann's faculty and departments to coordinate venue logistics seamlessly.
            </p>
            <button 
              onClick={scrollToAvailability}
              className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-emerald-500 hover:text-white shadow-2xl hover:shadow-emerald-500/40 group"
            >
              Explore Halls <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Campus Spaces Section - THE NEW CARDS */}
      <section id="availability-section" className="py-32 px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Live Status</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight italic uppercase">Campus Venues</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
              Select a venue below to check real-time availability and secure your departmental booking instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {halls.map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/halls/${h.id}`)}
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-y-3 cursor-pointer overflow-hidden ring-1 ring-slate-100"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Building2 className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500 shadow-sm">
                    <Building2 className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2 uppercase italic tracking-tight">{h.name}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-emerald-500" /> Mehdipatnam Campus
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Capacity: {h.capacity}</span>
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer keep existing or slightly refine colors */}
      <footer className="bg-slate-950 text-white py-20 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Building2 className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tighter uppercase italic">St. Ann's</span>
            </div>
          </div>
          {/* ... Navigation and Contact info (standard colors) ... */}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
           <p>© 2026 St. Ann's College Booking Portal</p>
           <p className="italic">Direct. Digital. Professional.</p>
        </div>
      </footer>
    </div>
  );
}