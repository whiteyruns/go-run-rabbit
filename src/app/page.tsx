import Link from "next/link";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata = {
  title: "Keith White — Event Production & Hospitality Technology",
  description: "I build events, then I build the tech that runs them. Event production, sponsorship platforms, and operations software for hospitality and live events. Las Vegas.",
  openGraph: {
    title: "Keith White — Event Production & Hospitality Technology",
    description: "Event production + custom software for hospitality and live events.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <div className={`${manrope.variable} min-h-screen bg-[#0e0e11] text-[#f3f0f4] font-[var(--font-manrope),system-ui,sans-serif] selection:bg-[#aea2ff] selection:text-[#1f0078]`}>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0e]/60 backdrop-blur-xl">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-black tracking-tighter">Keith White</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-gray-500 hover:text-gray-100 transition-all text-xs uppercase tracking-[0.2em]">Work</a>
            <a href="#services" className="text-gray-500 hover:text-gray-100 transition-all text-xs uppercase tracking-[0.2em]">Services</a>
            <a href="#about" className="text-gray-500 hover:text-gray-100 transition-all text-xs uppercase tracking-[0.2em]">About</a>
            <a href="#contact" className="text-gray-500 hover:text-gray-100 transition-all text-xs uppercase tracking-[0.2em]">Contact</a>
          </div>
          <a href="#contact" className="bg-gradient-to-br from-[#7157ff] to-[#aea2ff] text-[#1f0078] px-6 py-2 rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
            Connect
          </a>
        </div>
      </nav>

      <main className="pt-24">

        {/* HERO */}
        <section className="relative px-8 py-24 md:py-40 max-w-7xl mx-auto overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#aea2ff]/10 blur-[120px] rounded-full" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#00eefc]" />
              <span className="text-[#00eefc] text-xs uppercase tracking-[0.2em] font-bold">Go Run Rabbit</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8" style={{ textShadow: "0 0 20px rgba(174, 162, 255, 0.3)" }}>
              I build events.<br />
              Then I build<br />
              <span className="text-[#aea2ff]">the tech.</span>
            </h1>
            <p className="text-xl text-[#acaaae] max-w-xl leading-relaxed mb-12">
              Event production, sponsorship intelligence platforms, and operations software for hospitality and live events. Based in Las Vegas.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#work" className="bg-gradient-to-br from-[#7157ff] to-[#aea2ff] text-[#1f0078] px-8 py-4 rounded-md font-bold tracking-tight hover:opacity-90 transition-all flex items-center gap-2">
                View Projects
                <span className="text-sm">&rarr;</span>
              </a>
              <a href="#services" className="px-8 py-4 border border-[#48474b]/30 rounded-md font-bold hover:bg-[#19191d] transition-all">
                What I Do
              </a>
            </div>
          </div>
        </section>

        {/* CASE STUDIES — BENTO GRID */}
        <section id="work" className="px-8 py-24 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Selected Case Studies</h2>
            <div className="h-1 w-24 bg-[#aea2ff]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* CBM Dashboard — Large */}
            <a href="https://cbm.gorunrabbit.com" target="_blank" rel="noopener noreferrer" className="md:col-span-8 group cursor-pointer block">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] aspect-[16/9]">
                <img src="/projects/cbm-dashboard.jpg" alt="CBM Sponsorship Dashboard" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#aea2ff] text-[#1f0078] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Next.js</span>
                    <span className="bg-[#00eefc] text-[#005359] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Prisma</span>
                    <span className="bg-[#ff6b98] text-[#47001d] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Recharts</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">CBM Sponsorship Dashboard</h3>
                  <p className="text-[#acaaae] max-w-md">9-venue sponsorship intelligence platform for Corner Bar Management. POS analytics, case depletion modeling, brand pitch generation.</p>
                </div>
              </div>
            </a>

            {/* Swan Forest — Tall */}
            <a href="https://swanforestcamp.com" target="_blank" rel="noopener noreferrer" className="md:col-span-4 group cursor-pointer block">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] h-full min-h-[300px]">
                <img src="/projects/swan-forest-admin.jpg" alt="Swan Forest Camp Operations" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#ff6b98] text-[#47001d] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Firebase</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Swan Forest Camp</h3>
                  <p className="text-[#acaaae] text-sm">Full operations platform — interactive grid maps, real-time tracking, Stripe payments, member management.</p>
                </div>
              </div>
            </a>

            {/* East Fremont District — Wide */}
            <a href="https://eastfremontdistrict.com" target="_blank" rel="noopener noreferrer" className="md:col-span-7 group cursor-pointer block">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] aspect-[16/10]">
                <img src="/projects/efd.jpg" alt="East Fremont District platform" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#00eefc] text-[#005359] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Supabase</span>
                    <span className="bg-[#aea2ff] text-[#1f0078] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Resend</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">F.E.E.D. — East Fremont District</h3>
                  <p className="text-[#acaaae] text-sm">B2B marketing platform — &quot;Rent an Entire Entertainment District.&quot; 16 venues, activation tiers, inquiry pipeline.</p>
                </div>
              </div>
            </a>

            {/* Feed the Block */}
            <a href="https://eastfremontdistrict.com" target="_blank" rel="noopener noreferrer" className="md:col-span-5 group cursor-pointer block">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] aspect-[16/10]">
                <img src="/projects/feed-the-block.jpg" alt="Feed the Block concert event" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#00eefc] text-[#005359] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Production</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Feed the Block</h3>
                  <p className="text-[#acaaae] text-sm">Concert series — Marshmello, Gryffin, Diplo. 100K+ projected 2026. $400K municipal sponsorship.</p>
                </div>
              </div>
            </a>

            {/* Forest House — Small */}
            <a href="https://foresthou.se" target="_blank" rel="noopener noreferrer" className="md:col-span-5 group cursor-pointer block">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] aspect-[16/10]">
                <img src="/projects/forest-house.jpg" alt="Forest House Art Car" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-bold mb-2">Forest House Art Car</h3>
                  <p className="text-[#acaaae] text-sm">Mobile stage for Burning Man + EDC. Main stage for Feed the Block series.</p>
                </div>
              </div>
            </a>

            {/* Prodigal Swan */}
            <div className="md:col-span-7 group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-[#1f1f23] aspect-[21/10]">
                <img src="/projects/prodigal-swan.jpg" alt="Prodigal Swan art installation" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-bold mb-2">Prodigal Swan</h3>
                  <p className="text-[#acaaae] text-sm">Large-scale art installation — Burning Man. Design, fabrication, and playa logistics.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SERVICE PILLARS */}
        <section id="services" className="bg-[#131316] py-32">
          <div className="px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                <svg className="w-9 h-9 text-[#00eefc]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                <h3 className="text-2xl font-bold">Event Production</h3>
                <p className="text-[#acaaae] leading-relaxed">
                  Large-scale festival and concert production. Theme camp buildout for Burning Man.
                  Feed the Block series — 100K+ projected 2026. Permitting, staging, vendor coordination, crowd management.
                </p>
              </div>
              <div className="space-y-6">
                <svg className="w-9 h-9 text-[#aea2ff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
                <h3 className="text-2xl font-bold">Hospitality Technology</h3>
                <p className="text-[#acaaae] leading-relaxed">
                  POS analytics dashboards integrating Toast and SevenRooms. Sponsorship intelligence platforms.
                  Revenue modeling, case depletion analysis, automated reporting, brand pitch generation.
                </p>
              </div>
              <div className="space-y-6">
                <svg className="w-9 h-9 text-[#ff6b98]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.657-5.657a8 8 0 1111.314 0l-5.657 5.657zm0 0L12 21m-7.5-9h15M3.75 7.5h16.5" /></svg>
                <h3 className="text-2xl font-bold">Operations Platforms</h3>
                <p className="text-[#acaaae] leading-relaxed">
                  Camp management software with interactive maps and real-time tracking.
                  Member systems, Stripe payments, automated communications. Multi-tenant architecture, role-based access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="px-8 py-32 max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -inset-4 bg-[#aea2ff]/20 blur-3xl rounded-full" />
            <div className="relative aspect-square rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 border border-[#48474b]/20 bg-[#1f1f23]">
              <img src="/keith-white.jpg" alt="Keith White" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-5xl font-extrabold tracking-tight mb-8">
              Building the <span className="text-[#aea2ff]">infrastructure</span> behind the experience.
            </h2>
            <div className="space-y-6 text-lg text-[#acaaae]">
              <p>
                I&apos;m Keith White — a developer and event producer based in Las Vegas. I started in events, building theme camps at Burning Man and producing concerts on Fremont Street. The tools didn&apos;t exist, so I built them.
              </p>
              <p>
                Now I do both. The CBM Sponsorship Dashboard started as a pitch deck and became a full analytics platform. Swan Forest&apos;s operations system started as a spreadsheet and became a real-time management tool with interactive maps and payment processing.
              </p>
              <p>
                Under <span className="text-[#f3f0f4] font-bold">Go Run Rabbit</span>, I work with hospitality companies, event producers, and communities that need someone who can build the event AND build the software.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-black text-[#00eefc] mb-1">9</div>
                <div className="text-xs uppercase tracking-widest font-bold opacity-50">Venues Managed</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#ff6b98] mb-1">100K+</div>
                <div className="text-xs uppercase tracking-widest font-bold opacity-50">Event Attendees 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section id="contact" className="px-8 py-32 max-w-7xl mx-auto">
          <div className="bg-[#25252a] rounded-3xl p-12 md:p-24 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,162,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                Ready to build something <span className="text-[#00eefc]">extraordinary</span>?
              </h2>
              <p className="text-xl text-[#acaaae] max-w-2xl mx-auto mb-12">
                Whether it&apos;s a venue sponsorship strategy, a concert series, or a custom platform — let&apos;s talk.
              </p>
              <a href="mailto:keith@gorunrabbit.com" className="bg-[#aea2ff] text-[#1f0078] px-10 py-5 rounded-md font-bold text-lg hover:bg-[#a092ff] transition-all inline-block">
                keith@gorunrabbit.com
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#48474b]/20">
        <div className="max-w-7xl mx-auto py-12 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <span className="font-black text-lg">Go Run Rabbit LLC</span>
              <p className="text-[#48474b] text-xs mt-1">Event Production &middot; Hospitality Technology &middot; Las Vegas</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#48474b] mb-3">Projects</p>
                <div className="flex flex-col gap-2">
                  <a href="https://swanforestcamp.com" target="_blank" rel="noopener noreferrer" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">Swan Forest Camp</a>
                  <a href="https://foresthou.se" target="_blank" rel="noopener noreferrer" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">Forest House</a>
                  <a href="https://eastfremontdistrict.com" target="_blank" rel="noopener noreferrer" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">F.E.E.D. — East Fremont District</a>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#48474b] mb-3">Links</p>
                <div className="flex flex-col gap-2">
                  <a href="mailto:keith@gorunrabbit.com" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">Contact</a>
                  <a href="https://swanforestcamp.com/terms" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">Terms</a>
                  <a href="https://swanforestcamp.com/privacy" className="text-[#acaaae] hover:text-[#00eefc] transition-colors text-sm">Privacy</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#48474b]/10 pt-6 text-[#48474b] text-xs">
            &copy; 2026 Go Run Rabbit LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
