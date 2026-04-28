'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Users, ArrowRight, MapPin, Plus, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- ORIGINAL NAV --- */}
      <nav className="border-b border-slate-100 px-8 py-6 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight uppercase">St. Ann's College</span>
        </div>
      </nav>

      {/* --- ORIGINAL HERO --- */}
      <section className="relative h-[70vh] flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dee81c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40"
            alt="St. Ann's Campus"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase mb-4">
            Seminar Hall <br /> <span className="text-emerald-500">Booking Portal</span>
          </h1>
          <p className="text-slate-200 max-w-xl mx-auto text-lg mb-10 font-medium">
            Official platform for faculty and departments to reserve campus venues.
          </p>
          <a href="#venues" className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg">
            Browse Venues
          </a>
        </div>
      </section>

      {/* --- VENUES SECTION --- */}
      <section id="venues" className="py-20 px-10 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold uppercase tracking-tight border-l-4 border-emerald-600 pl-4">Available Venues</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {halls.map((h) => (
            <div 
              key={h.id} 
              onClick={() => router.push(`/halls/${h.id}`)}
              className="group border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer bg-white"
            >
              {/* Card Image */}
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={h.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"} 
                  alt={h.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight text-slate-800">{h.name}</h3>
                <div className="flex items-center gap-6 text-slate-500 mb-8 font-semibold text-sm">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> {h.capacity} Seats</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /> Main Block</div>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-slate-50 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  View Availability
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ORIGINAL FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-emerald-600" />
              <span className="text-xl font-bold uppercase tracking-tight text-slate-800">St. Ann's College</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-medium">
              Academic excellence through world-class infrastructure and facilities.
            </p>
          </div>
          
          <div className="flex gap-6">
            <Instagram className="w-5 h-5 text-slate-400 hover:text-emerald-600 cursor-pointer" />
            <Facebook className="w-5 h-5 text-slate-400 hover:text-emerald-600 cursor-pointer" />
            <Twitter className="w-5 h-5 text-slate-400 hover:text-emerald-600 cursor-pointer" />
          </div>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            © 2024 ST. ANN'S COLLEGE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}