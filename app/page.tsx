'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Globe, 
  GraduationCap,
  MapPin,
  Mail
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-emerald-100">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">St. Ann's</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Hall Booking</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Link 
            href="/admin" 
            className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
          >
            Admin Login
          </Link>
          <Link 
            href="/admin" 
            className="md:hidden p-2 text-slate-400"
          >
            <ShieldCheck className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Centralized Campus Resource</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-8 text-slate-900">
            Premium Seminar <br />
            <span className="text-emerald-600">Halls & Spaces.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium mb-12 leading-relaxed">
            The official digital gateway for reserving St. Ann's premier seminar halls and auditoriums. Optimized for departmental efficiency and academic excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/halls" 
              className="w-full sm:w-auto px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group"
            >
              View Availability <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: "Real-time Scheduling",
              desc: "Instant visibility into hall availability. No more manual logbooks or scheduling conflicts."
            },
            {
              icon: ShieldCheck,
              title: "Official Verification",
              desc: "Secure booking system requiring official campus credentials for all departmental reservations."
            },
            {
              icon: Calendar,
              title: "Digital Records",
              desc: "Automated event logs and departmental history for seamless administrative reporting."
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4">{feature.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-lg font-black uppercase italic tracking-tighter">St. Ann's College</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
                Empowering our departments with modern digital infrastructure for seamless event management and hall coordination.
              </p>
            </div>
            
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Contact Portal</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-500 text-xs font-bold hover:text-emerald-600 transition-colors">
                  <Mail className="w-4 h-4" /> office@stannscollege.com
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-xs font-bold hover:text-emerald-600 transition-colors">
                  <MapPin className="w-4 h-4" /> Mehdipatnam, Hyderabad
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Administrative</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/admin" className="text-slate-500 text-xs font-bold hover:text-emerald-600 transition-colors uppercase tracking-widest">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/halls" className="text-slate-500 text-xs font-bold hover:text-emerald-600 transition-colors uppercase tracking-widest">
                    Hall Directory
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2024 St. Ann's College for Women. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <Globe className="w-4 h-4 text-slate-300" />
              <GraduationCap className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}