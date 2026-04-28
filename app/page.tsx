'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Users, ArrowRight, MapPin, Plus, Mail, ChevronDown } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* 1. NEW CINEMATIC DARK HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
        
        {/* Background Image with heavy overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 grayscale"
            alt="Campus"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617] to-[#020617]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Elite Venue Management</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tight uppercase italic leading-[0.9] mb-8">
            RESERVE THE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">FUTURE.</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-12 opacity-80">
            Experience the next generation of campus event scheduling. Precision, speed, and elegance for St. Ann's premium seminar halls.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="#availability-section" className="group relative inline-flex items-center gap-4 bg-emerald-500 text-slate-950 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
              Browse Halls <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* 2. VENUES GRID (DARK CARDS) */}
      <section id="availability-section" className="py-32 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6 border-l-4 border-emerald-500 pl-8">
            <div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">The Collection</h2>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.5em] mt-4">Selected Venues • Live Status</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {halls.map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/halls/${h.id}`)}
                className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-emerald-500/50 hover:bg-white/[0.05] cursor-pointer"
              >
                {/* PICTURE AREA */}
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={h.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"} 
                    alt={h.name}
                    className="w-full h-full object-cover grayscale opacity-60 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                  
                  <div className="absolute top-6 right-6">
                    <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Live
                    </div>
                  </div>
                </div>

                <div className="p-10 relative">
                  <h3 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">{h.name}</h3>
                  <div className="flex items-center gap-6 text-slate-500 mb-10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Users className="w-4 h-4 text-emerald-500" /> {h.capacity} CAP
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-emerald-500" /> Block A
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest transition-colors">Enter Portal</span>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DARK FOOTER */}
      <footer className="bg-black py-24 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                    <Building2 className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic text-white">St. Ann's</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                Setting the standard for campus facility management. Digital first, seamless always.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">Navigation</h4>
              {['Inventory', 'Policies', 'Guidelines', 'Help'].map(link => (
                <span key={link} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors w-fit">{link}</span>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Stay Updated</h4>
              
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">
                © 2024 St. Ann's • Design V2.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}