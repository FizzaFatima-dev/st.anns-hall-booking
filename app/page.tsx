'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Users, Wifi, ArrowRight, MapPin, User, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      {/* Hero and Nav remains the same as previous sleek version */}
      
      <section id="availability-section" className="py-24 px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-16 uppercase italic tracking-tight text-center">Available Venues</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {halls.map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/halls/${h.id}`)}
                className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ring-1 ring-slate-100"
              >
                {/* PICTURE AREA */}
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={h.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"} 
                    alt={h.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <Plus className="w-4 h-4 text-emerald-400" /> Check Availability
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2 uppercase italic">{h.name}</h3>
                  <div className="flex items-center gap-4 text-slate-400 mb-8">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><Users className="w-3 h-3" /> {h.capacity}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><MapPin className="w-3 h-3" /> Block A</div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Open Portal</span>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}