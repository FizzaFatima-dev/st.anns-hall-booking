// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { MapPin, ArrowRight, Building2 } from 'lucide-react';

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

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const { data: hallsData } = await supabase.from('halls').select('*').order('name');
        
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, hall_id, status, booking_date')
          .eq('booking_date', todayStr)
          .in('status', ['Confirmed', 'Pending']);

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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans font-medium tracking-[0.2em] text-slate-500 animate-pulse">Loading Venues Layout...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 py-5 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
             <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">St. Ann's Portal</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">Campus Venue Reservations</h1>
          <p className="text-slate-500 mt-3 text-sm md:text-base max-w-xl font-medium">Select an institutional venue below to check real-time availability grids, manage existing holds, or request scheduling code verifications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {halls.map((hall) => {
            const activeToday = todayBookings.filter(b => b.hall_id === hall.id);
            const hasPendingOnly = activeToday.every(b => b.status === 'Pending') && activeToday.length > 0;

            return (
              <div 
                key={hall.id}
                onClick={() => router.push(`/halls/${hall.id}`)}
                className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                      <Building2 className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    
                    {activeToday.length > 0 ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border uppercase ${
                        hasPendingOnly 
                          ? 'bg-amber-50 border-amber-100 text-amber-700' 
                          : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        {activeToday.length} {activeToday.length === 1 ? 'Hold Today' : 'Holds Today'} {hasPendingOnly && '(Pending)'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide rounded-full uppercase">Available Today</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">{hall.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs mt-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Main Institutional Campus Block</span>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-100/50 transition-colors">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition-colors">Check Booking Grid</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}