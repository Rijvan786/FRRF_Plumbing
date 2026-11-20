import React, { useEffect, useState } from 'react'

const About = () => {
const WHY = [
  { icon: '🏅', title: 'Certified Plumbers', desc: '100% background-checked, licensed master technicians with 5+ years experience.' },
  { icon: '⚡', title: 'Fastest Response', desc: 'Average 18-minute arrival for critical leaks and emergency bursts — any hour.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Upfront itemised estimates before work starts. Zero hidden fees, zero surprises.' },
  { icon: '🔄', title: '30-Day Warranty', desc: "Free rework guarantee for 30 days if anything isn't running perfectly after service." },
];

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div>
           {/* ════════════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 sm:py-24 px-4 sm:px-6 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,44px)] text-[#0A1628] tracking-tight leading-tight mb-3">
              Why Homeowners Choose{' '}
              <span className="text-cyan-500">FRRF Plumbing Services</span>
            </h2>
            <p className="text-slate-500 text-[clamp(14px,2vw,17px)] max-w-md mx-auto leading-relaxed">
              We don't just fix pipes — we build lasting trust with every service call.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {WHY.map((w, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_14px_36px_rgba(0,180,216,0.11),0_0_0_1px_rgba(0,180,216,0.18)] cursor-default"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-blue-600/8 border border-cyan-500/18 rounded-2xl flex items-center justify-center text-2xl mb-5">
                  {w.icon}
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#0A1628] mb-2">
                  {w.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default About