// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { MapPin, ArrowRight, Building2, Calendar, ShieldCheck, Users, Mail, Phone, Globe } from 'lucide-react';

interface Hall {
  id: string;
  name: string;
  capacity?: string | number;
  amenities?: string[];
}

interface Booking {
  id: string;
  hall_id: string;
  status: string;
  booking_date: string;
}

export default function HomePage() {
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Explicit mapping helper for custom venue visual assets
  const getVenueImage = (name: string): string => {
    const venue = name.toLowerCase();
    if (venue.includes('gnanamma')) {
      return 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80'; // Seminar Hall Style
    }
    if (venue.includes('deickmann')) {
      return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'; // Modern Seminar Room
    }
    if (venue.includes('auditorium')) {
      return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'; // Grand Auditorium Structure
    }
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'; // Fallback Institutional Clean Office
  };

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const { data: hallsData } = await supabase.from('halls').select('*').order('name');
        
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, hall_id, status, booking_date')
          .eq('booking_date', todayStr)
          .eq('status', 'Confirmed');

        if (hallsData) {
          const mapNames = hallsData.map((h) => {
            let cleanName = h.name;
            if (h.name === "Seminar Hall 1") cleanName = "Gnanamma Hall";
            else if (h.name === "Seminar Hall 2") cleanName = "Deickmann Hall";
            else if (h.name.includes("Auditorium")) cleanName = "St. Joseph's Auditorium";
            return { ...h, name: cleanName };
          });
          setHalls(mapNames);
        }
        if (bookingsData) setTodayBookings(bookingsData);
      } catch (err) {
        console.error("Error synchronizing home grid assets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans font-medium tracking-[0.2em] text-slate-500 animate-pulse">
        Loading Venues Layout...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 py-5 sticky top-0 z-40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
               <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">St. Ann's Portal</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-slate-500 tracking-wide">
            <span className="text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Authorized Access</span>
            <span>Academic Term 2026</span>
          </div>
        </nav>

        {/* Hero Background Showcase Section */}
        <div className="relative bg-slate-900 text-white py-24 px-6 md:px-12 overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-25 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5" /> Live Scheduling Infrastructure
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
              Campus Venue Reservations
            </h1>
            <p className="text-slate-300 mt-4 text-sm md:text-lg max-w-2xl font-medium leading-relaxed">
              Select an institutional venue below to check real-time availability grids, manage existing holds, or request scheduling code verifications instantly.
            </p>
          </div>
        </div>

        {/* Venues Layout Card Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {halls.map((hall) => {
              const activeToday = todayBookings.filter(b => b.hall_id === hall.id);
              const cardImage = getVenueImage(hall.name);

              return (
                <div 
                  key={hall.id}
                  onClick={() => router.push(`/halls/${hall.id}`)}
                  className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
                >
                  <div>
                    {/* Immersive Card Header Picture Block */}
                    <div className="h-48 w-full relative bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img 
                        src={cardImage} 
                        alt={hall.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                      
                      <div className="absolute top-4 right-4">
                        {activeToday.length > 0 ? (
                          <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold tracking-wide rounded-full uppercase shadow-sm">
                            {activeToday.length} {activeToday.length === 1 ? 'Hold Today' : 'Holds Today'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold tracking-wide rounded-full uppercase shadow-sm">
                            Available Today
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">
                        {hall.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-4">
                        Equipped with high-definition multi-projection displays, integrated digital climate management, and flexible stage layouts.
                      </p>
                      
                      <div className="flex flex-wrap gap-4 items-center text-slate-400 font-semibold text-xs pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Main Block</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>120+ Capacity</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-100/50 transition-colors">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition-colors">
                      Check Booking Grid
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Institutional Portal Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-white font-bold tracking-tight">
              <Building2 className="w-5 h-5 text-emerald-500" /> St. Ann's Campus Venues
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Providing modern infrastructure booking solutions for localized college events, dynamic technical symposiums, and administrative gatherings.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold tracking-wide text-slate-400">
            <a href="mailto:support@stanns.edu" className="flex items-center gap-1.5 hover:text-white transition-colors"><Mail className="w-4 h-4 text-emerald-500"/> Support Desk</a>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-500"/> +91 Emergency Ext</span>
            <a href="https://stannscollegehyd.ae.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors"><Globe className="w-4 h-4 text-emerald-500"/> Institution Website</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 text-center text-[11px] text-slate-600 font-medium">
          &copy; 2026 St. Ann's Degree & PG College. All infrastructure layouts and reservation access rights reserved securely.
        </div>
      </footer>
    </div>
  );
}