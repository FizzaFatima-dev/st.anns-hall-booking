'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Wifi, ArrowRight, 
  Calendar, Mail, MapPin, Zap
} from 'lucide-react';

const HallSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden p-8 space-y-6 animate-pulse shadow-sm">
    <div className="h-56 bg-slate-100 rounded-3xl w-full" />
    <div className="space-y-3">
        <div className="h-6 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-50 rounded w-1/2" />
    </div>
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
          if (hall.name === "Seminar Hall 1") { finalName = "Gnanamma Hall"; finalCapacity = 200; }
          else if (hall.name === "Seminar Hall 2") { finalName = "Deickmann Hall"; finalCapacity = 200; }
          else if (hall.name.includes("Auditorium")) { finalName = "St. Joseph's Auditorium"; finalCapacity = 800; }
          return { ...hall, name: finalName, capacity: finalCapacity };
        });
        setHalls(updatedHalls);
      }
      setLoading(false);
    }
    fetchHalls();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="flex flex-col min-h-screen bg-white font-sans antialiased text-slate-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-5 transition-all duration-500 ${isScrolled ? 'bg-white shadow-md border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg overflow-hidden">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className={`text-xl font-black uppercase italic ${isScrolled ? 'text-slate-900' : 'text-white'}`}>St. Ann's <span className="text-emerald-400">Halls</span></span>
        </div>
        <div className={`hidden md:flex gap-10 font-black text-[10px] uppercase tracking-[0.3em] ${isScrolled ? 'text-slate-500' : 'text-white/80'}`}>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-emerald-500 cursor-pointer">Home</button>
          <button onClick={scrollToAvailability} className="hover:text-emerald-500 cursor-pointer">Availability</button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <header className="relative min-h-screen flex items-center pt-20">
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://i.ytimg.com/vi/6PSL5bKVzOs/maxresdefault.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/40 z-0" />
          </div>

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Official Portal
              </div>
              <h1 className="text-5xl md:text-8xl font-light text-white leading-tight mb-6 uppercase italic">
                Book Your <br />
                <span className="text-emerald-400 font-black">Campus Space</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-md font-medium leading-relaxed">
                Streamlined reservation system for St. Ann's premier venues. Secure your space in a few clicks.
              </p>
              <button 
                onClick={scrollToAvailability}
                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-xl group active:scale-95 cursor-pointer"
              >
                Explore Halls <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Side Cards */}
            <div className="hidden lg:block space-y-4">
              {halls.slice(0, 3).map((hall, i) => (
                <div key={hall.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex justify-between items-center shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><Zap className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-black text-white italic">{hall.name}</h3>
                      <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">{hall.capacity} Capacity</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Hall Availability Section */}
        <section id="availability-section" className="relative z-30 py-24 bg-[#FBFBFE] px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.6em] mb-4 block">Venue Directory</span>
              <h2 className="text-4xl md:text-6xl font-light text-slate-900 uppercase italic">Hall Availability</h2>
              <div className="w-20 h-1 bg-emerald-500 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <><HallSkeleton /><HallSkeleton /><HallSkeleton /></>
              ) : (
                halls.map((hall) => (
                  <div key={hall.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-lg group hover:-translate-y-2 transition-all duration-500">
                    <div className="h-60 overflow-hidden">
                      <img src={getHallImage(hall.name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={hall.name} />
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-light text-slate-900 mb-6 uppercase italic">{hall.name}</h3>
                      <div className="flex gap-3 mb-8">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 uppercase">
                          <Users className="w-4 h-4 text-emerald-500" /> {hall.capacity} Seats
                        </div>
                      </div>
                      <Link href={`/halls/${hall.id}`} className="flex justify-center items-center gap-3 w-full py-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                        <Calendar className="w-4 h-4" /> Open Calendar
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg p-1"><img src="/favicon.ico" alt="Logo" /></div>
              <span className="text-2xl font-black italic">St. Ann's</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose">Official venue coordination platform.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-6 text-emerald-400">Contact</h4>
            <ul className="space-y-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> info@stannscollegehyd.com</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Hyderabad, India</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-[9px] font-black uppercase text-slate-600 text-center">
          © 2026 St. Ann's College Booking Portal
        </div>
      </footer>
    </div>
  );
}