import Link from "next/link";

export const metadata = {
  title: "Go Run Rabbit — Event Production & Hospitality Technology",
  description: "I build events, then I build the tech that runs them. Event production, sponsorship platforms, and operations software for hospitality and live events.",
  openGraph: {
    title: "Go Run Rabbit — Event Production & Hospitality Technology",
    description: "Event production + custom software for hospitality and live events. Las Vegas.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-between items-center bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <Link href="/">
          <img src="/logo-sm.png" alt="Go Run Rabbit" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#work" className="text-sm text-gray-500 hover:text-white transition-colors">Work</a>
          <a href="#what-i-do" className="text-sm text-gray-500 hover:text-white transition-colors">Services</a>
          <a href="#about" className="text-sm text-gray-500 hover:text-white transition-colors">About</a>
          <a href="#contact" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">Get in Touch</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-24 pb-16 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(196,154,108,0.06),transparent_60%)]" />
        <img src="/logo.png" alt="Go Run Rabbit" className="w-48 mb-10 opacity-70 animate-[fadeUp_1s_ease_0.2s_both]" />
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6 max-w-3xl animate-[fadeUp_0.8s_ease_0.4s_both]">
          I build events.<br />
          <span className="text-amber-400">Then I build the tech</span><br />
          that runs them.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl leading-relaxed mb-10 animate-[fadeUp_0.8s_ease_0.6s_both]">
          Event production, sponsorship intelligence platforms, and operations software for hospitality and live events. Based in Las Vegas.
        </p>
        <div className="flex gap-4 animate-[fadeUp_0.8s_ease_0.8s_both]">
          <a href="#work" className="bg-amber-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 hover:-translate-y-0.5 transition-all">See the Work</a>
          <a href="#contact" className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:border-gray-500 hover:text-white transition-all">Get in Touch</a>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section id="work" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">Featured Work</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">What I&apos;ve Built</h2>
          <p className="text-gray-500 max-w-xl leading-relaxed mb-14">Production, software, and strategy — from Burning Man camps to Downtown Vegas venue portfolios.</p>

          <div className="space-y-6">
            {/* CBM Dashboard */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="aspect-[21/9] bg-gradient-to-br from-amber-950/30 to-gray-900 flex items-center justify-center text-gray-600">
                <span className="text-sm tracking-wider uppercase">Dashboard Screenshot</span>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">CBM Sponsorship Dashboard</h3>
                    <p className="text-amber-400 text-sm font-medium">Corner Bar Management &middot; 9 Venues &middot; Downtown Las Vegas</p>
                  </div>
                  <a href="https://cbm.claymoreandcolt.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full hover:text-white hover:border-gray-500 transition-colors flex-shrink-0">
                    Live &rarr;
                  </a>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Data-driven sponsorship intelligence platform for a 9-venue hospitality portfolio. Ingests Toast POS data across all locations,
                  models case depletions by spirit category, calculates CPM against Strip competitors, and generates shareable brand pitch pages.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-5">
                  <li>&bull; 58K+ drink sales records analyzed across 96 menu items and 9 venues</li>
                  <li>&bull; Estimated $2.1M+ addressable sponsorship opportunity identified</li>
                  <li>&bull; Revenue scenario modeling, guest journey mapping, Vegas tentpole calendar</li>
                  <li>&bull; Role-based access: internal analytics, client portal, public brand pitch links</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "Prisma", "SQLite", "Recharts", "JWT Auth", "Cloudflare Tunnel"].map(t => (
                    <span key={t} className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* East Fremont District */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="aspect-[21/9] bg-gradient-to-br from-orange-950/30 to-gray-900 flex items-center justify-center text-gray-600">
                <span className="text-sm tracking-wider uppercase">Platform Screenshot</span>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">F.E.E.D. — East Fremont Entertainment District</h3>
                    <p className="text-orange-400 text-sm font-medium">District Marketing Platform &middot; 16 Venues &middot; 108K+ Sq Ft</p>
                  </div>
                  <a href="https://east-fremont-district.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full hover:text-white hover:border-gray-500 transition-colors flex-shrink-0">
                    Live &rarr;
                  </a>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  B2B marketing and booking platform that positions East Fremont as a single rentable entertainment district.
                  &quot;Rent an Entire Entertainment District&quot; — one operator, 16 venues, unified production, security, and city coordination.
                  Designed to convert corporate event planners, brand activation teams, and convention organizers.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-5">
                  <li>&bull; Interactive district map, venue inventory with capacity/features/zones</li>
                  <li>&bull; Tiered activation frameworks: single venue to full district takeover</li>
                  <li>&bull; Inquiry pipeline with Resend email notifications and Supabase persistence</li>
                  <li>&bull; Case studies (Feed the Block: 15K+ street activation), SEO infrastructure</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "Supabase", "Resend", "Recharts", "Sharp", "Vercel"].map(t => (
                    <span key={t} className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Swan Forest */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="aspect-[21/9] bg-gradient-to-br from-emerald-950/30 to-gray-900 flex items-center justify-center text-gray-600">
                <span className="text-sm tracking-wider uppercase">Admin Dashboard Screenshot</span>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Swan Forest Camp — Operations Platform</h3>
                    <p className="text-emerald-400 text-sm font-medium">Burning Man Theme Camp &middot; Full-Stack Operations</p>
                  </div>
                  <a href="https://swanforestcamp.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full hover:text-white hover:border-gray-500 transition-colors flex-shrink-0">
                    Live &rarr;
                  </a>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Full operations backend for a Burning Man theme camp. Interactive grid map with drag-to-assign RV placement,
                  real-time arrival tracking with animated dots, day/night mode, A* pathfinding for walking routes,
                  vehicle fleet tracking, and sub-cell precision layout editing.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-5">
                  <li>&bull; Interactive camp map: zoom/pan, search, heatmap, neighbor connections, 3D isometric toggle</li>
                  <li>&bull; Member management with role-based auth, Stripe payments, automated email campaigns</li>
                  <li>&bull; Real-time arrival detection, vehicle fleet subscriptions, capacity stats</li>
                  <li>&bull; Admin tools: drag-to-reposition, layout edit mode, visual feedback system</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "Firebase", "Stripe", "Cloudinary", "Leaflet", "React Email", "Playwright"].map(t => (
                    <span key={t} className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed the Block */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="aspect-[21/9] bg-gradient-to-br from-red-950/30 to-gray-900 flex items-center justify-center text-gray-600">
                <span className="text-sm tracking-wider uppercase">Event Photo</span>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Feed the Block</h3>
                    <p className="text-red-400 text-sm font-medium">Concert Series &middot; Wynn Nightlife &middot; Fremont East</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Free open-air block party series at 6th &amp; Fremont, co-produced with Wynn Nightlife and Corner Bar Management.
                  World-class headliners performing on the Forest House Art Car stage. 2025 debut drew 40K+ fans across 3 shows.
                  Scaling to 10 events in 2026 with Marshmello kicking off April 2nd.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-5">
                  <li>&bull; 100K+ projected total attendance across 2026 season</li>
                  <li>&bull; $400K confirmed municipal sponsorship (LVCVA + City of Las Vegas)</li>
                  <li>&bull; Headliners: Marshmello, Gryffin, Diplo / Major Lazer</li>
                  <li>&bull; Full production: staging, sound, permitting, vendor coordination, crowd management</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  {["Event Production", "Sponsorship", "Permitting", "Vendor Mgmt"].map(t => (
                    <span key={t} className="text-xs font-mono text-gray-500 bg-gray-800 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Forest House */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Forest House Art Car</h3>
                  <p className="text-purple-400 text-sm font-medium">Mobile Stage &middot; Burning Man + EDC</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Mobile stage and art car built for Burning Man and Electric Daisy Carnival.
                Serves as the main stage for Feed the Block. Custom-built infrastructure for live music in extreme environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT I DO */}
      <section id="what-i-do" className="py-24 px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">Services</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">What I Do</h2>
          <p className="text-gray-500 max-w-xl leading-relaxed mb-14">Three things, done well. Most people in this space do one. I do all three.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="text-2xl mb-4">&#127902;</div>
              <h3 className="text-lg font-bold text-white mb-3">Event Production</h3>
              <ul className="text-sm text-gray-500 space-y-2 leading-relaxed">
                <li>Large-scale festival and concert production</li>
                <li>Theme camp buildout for Burning Man and regionals</li>
                <li>Feed the Block series — 100K+ projected in 2026</li>
                <li>Permitting, vendors, staging, crowd management</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="text-2xl mb-4">&#128200;</div>
              <h3 className="text-lg font-bold text-white mb-3">Hospitality Technology</h3>
              <ul className="text-sm text-gray-500 space-y-2 leading-relaxed">
                <li>POS analytics dashboards (Toast, SevenRooms)</li>
                <li>Sponsorship intelligence platforms</li>
                <li>Revenue modeling and scenario analysis</li>
                <li>Automated reporting and brand pitch tools</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="text-2xl mb-4">&#9881;</div>
              <h3 className="text-lg font-bold text-white mb-3">Operations Platforms</h3>
              <ul className="text-sm text-gray-500 space-y-2 leading-relaxed">
                <li>Camp management software with interactive maps</li>
                <li>Real-time fleet tracking and logistics</li>
                <li>Member systems, Stripe payments, comms</li>
                <li>Role-based admin with multi-tenant architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start">
            <div>
              <div className="aspect-square bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-gray-600">
                <span className="text-sm tracking-wider uppercase">Photo</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">About</p>
              <h2 className="text-3xl font-extrabold text-white mb-6">Keith White</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  I&apos;m a developer and event producer based in Las Vegas. I started in events — building theme camps at Burning Man,
                  producing concerts on Fremont Street, and managing logistics for large-scale gatherings. Along the way, I kept running
                  into the same problem: the tools didn&apos;t exist, so I built them.
                </p>
                <p>
                  Now I do both. I produce events and build the software that powers hospitality businesses.
                  The CBM Sponsorship Dashboard started as a pitch deck and became a full analytics platform.
                  The Swan Forest operations system started as a spreadsheet and became a real-time camp management tool
                  with interactive maps, payment processing, and automated communications.
                </p>
                <p className="text-gray-500">
                  I work with hospitality companies, event producers, and communities that need someone who can
                  build the event AND build the software. If your next project needs both — let&apos;s talk.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                <span>Currently working with:</span>
                <span className="text-gray-400 font-medium">Corner Bar Management</span>
                <span className="text-gray-700">&middot;</span>
                <span className="text-gray-400 font-medium">Swan Forest Camp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Let&apos;s Build Something</h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-10">
            Whether it&apos;s a venue sponsorship strategy, an event production, or a custom platform — I&apos;d like to hear about it.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:keith@gorunrabbit.com" className="bg-amber-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 hover:-translate-y-0.5 transition-all">keith@gorunrabbit.com</a>
            <a href="https://swanforestcamp.com" target="_blank" rel="noopener noreferrer" className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:border-gray-500 hover:text-white transition-all">Swan Forest Camp</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/50 py-8 px-8 text-center">
        <p className="text-xs text-gray-700">
          &copy; 2026 Go Run Rabbit LLC &middot; Las Vegas, NV &middot;{" "}
          <a href="mailto:keith@gorunrabbit.com" className="text-gray-600 hover:text-white transition-colors">Contact</a>
        </p>
      </footer>
    </div>
  );
}
