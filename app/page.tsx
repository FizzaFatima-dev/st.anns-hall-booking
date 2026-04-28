'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Users, ArrowRight, MapPin, Plus, Mail } from 'lucide-react';

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
      {/* 1. HERO / HOME SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Campus Background"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Official Booking Portal</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
            Elevate Your <br /> <span className="text-emerald-500">Events.</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm font-medium leading-relaxed mb-10">
            Premium seminar halls and event spaces at St. Ann's. Seamless scheduling for departments and organizations.
          </p>
          <a href="#availability-section" className="inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-2xl">
            Explore Venues <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 2. AVAILABLE VENUES SECTION */}
      <section id="availability-section" className="py-32 px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Available Venues</h2>
                <div className="h-1.5 w-24 bg-emerald-500 mt-6" />
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Select a hall to view live calendar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {halls.map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/halls/${h.id}`)}
                className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ring-1 ring-slate-100"
              >
                {/* PICTURE AREA */}
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={h.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"} 
                    alt={h.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <Plus className="w-4 h-4 text-emerald-400" /> View Availability & Book
                    </span>
                  </div>
                </div>

                <div className="p-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase italic tracking-tight">{h.name}</h3>
                  <div className="flex items-center gap-6 text-slate-400 mb-10">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Users className="w-4 h-4 text-emerald-500" /> {h.capacity} Seats
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-emerald-500" /> Block A
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Open Portal</span>
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center group-hover:bg-emerald-500 group-hover:rotate-12 transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOOTER SECTION */}
      <footer className="bg-slate-950 text-white py-20 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Building2 className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic">St. Ann's</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                Providing state-of-the-art facilities for academic excellence and professional gatherings. Our venues are designed to inspire.
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Quick Links</h4>
              <ul className="space-y-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Hall Policies</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Support</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Connect</h4>
              <div className="flex gap-4">
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2024 St. Ann's College. All Rights Reserved.</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <Mail className="w-3 h-3" /> events@stanns.edu
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}