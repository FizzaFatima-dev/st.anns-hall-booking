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
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans">
      
      {/* --- 1. PROFESSIONAL HERO SECTION --- */}
      <section className="relative h-[90vh] flex items-center justify-center">
        {/* Real Background Image with Professional Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dee81c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-50"
            alt="St. Ann's Campus"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/80 via-[#0A0C10]/60 to-[#0A0C10]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="text-3xl font-bold tracking-tighter uppercase text-white">St. Ann's College</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight uppercase mb-6 leading-tight">
            Seminar Hall <br /> <span className="text-emerald-500">Booking Portal</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium mb-10">
            Secure and streamlined event scheduling for faculty and departments. Access our premium venues with a single click.
          </p>

          <a href="#availability-section" className="inline-flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
            View Availability <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* --- 2. VENUES SECTION --- */}
      <section id="availability-section" className="py-24 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Our Venues</h2>
                <div className="h-1 w-20 bg-emerald-500 mt-4" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {halls.map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/halls/${h.id}`)}
                className="group bg-[#161B22] border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-2 cursor-pointer shadow-xl"
              >
                <div className="h-60 overflow-hidden relative">
                  <img 
                    src={h.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop"} 
                    alt={h.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">{h.name}</h3>
                  <div className="flex items-center gap-6 text-slate-400 mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Users className="w-4 h-4 text-emerald-500" /> {h.capacity} Seats
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-emerald-500" /> Main Block
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Open Booking</span>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. PROFESSIONAL FOOTER --- */}
      <footer className="bg-[#0D1117] py-20 px-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold tracking-tighter uppercase text-white">St. Ann's College</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Dedicated to providing world-class facilities for academic growth and professional development.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">Navigation</h4>
              <ul className="space-y-3 text-slate-500 text-xs font-bold uppercase">
                <li className="hover:text-emerald-500 cursor-pointer transition-colors">Hall Inventory</li>
                <li className="hover:text-emerald-500 cursor-pointer transition-colors">Guidelines</li>
                <li className="hover:text-emerald-500 cursor-pointer transition-colors">Support</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">Contact</h4>
              <div className="flex gap-4 mb-4">
                <Instagram className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
                <Facebook className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2024 St. Ann's College</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}