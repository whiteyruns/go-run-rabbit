import Link from "next/link";

export const metadata = {
  title: "Go Run Rabbit — Event Production & Camp Management",
  description: "Go Run Rabbit LLC — Event production and camp management. We build community experiences, from large-scale festivals to intimate gatherings.",
  openGraph: {
    title: "Go Run Rabbit — Event Production & Camp Management",
    description: "Event production and camp management. We build community experiences.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-700" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex justify-between items-center bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <Link href="/"><img src="/logo-sm.png" alt="Go Run Rabbit" className="h-9 hover:opacity-80 transition-opacity" /></Link>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#services" className="text-sm font-medium text-gray-600 hover:text-[#2B47A8] transition-colors">Services</a>
          <a href="#work" className="text-sm font-medium text-gray-600 hover:text-[#2B47A8] transition-colors">Work</a>
          <a href="#clients" className="text-sm font-medium text-gray-600 hover:text-[#2B47A8] transition-colors">Clients</a>
          <a href="#contact" className="bg-[#2B47A8] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1E3380] transition-colors">Get in Touch</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_20%,rgba(43,71,168,0.04),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(232,59,46,0.03),transparent_50%)]" />
        <img src="/logo.png" alt="Go Run Rabbit" className="w-72 mb-8 drop-shadow-lg animate-[fadeUp_1s_ease_0.3s_both]" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5 animate-[fadeUp_0.8s_ease_0.5s_both]">
          We Build <span className="text-[#2B47A8]">Community<br />Experiences</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10 animate-[fadeUp_0.8s_ease_0.7s_both]">
          Event production, camp management, and infrastructure for festivals, gatherings, and everything in between.
        </p>
        <div className="flex gap-4 animate-[fadeUp_0.8s_ease_0.9s_both]">
          <a href="#work" className="bg-[#2B47A8] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1E3380] hover:-translate-y-0.5 hover:shadow-lg transition-all">See Our Work</a>
          <a href="#contact" className="border-2 border-gray-200 text-gray-600 px-8 py-3 rounded-xl font-semibold hover:border-[#2B47A8] hover:text-[#2B47A8] transition-all">Get in Touch</a>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-[#2B47A8] uppercase tracking-[0.15em] mb-3">What We Do</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Full-Service Event Production</h2>
          <p className="text-gray-500 max-w-xl leading-relaxed mb-14">From concept to teardown, we handle the moving parts so you can focus on what matters — the experience.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "&#9878;", title: "Event Production", desc: "End-to-end production for large-scale events and festivals. Planning, permitting, vendor coordination, and on-site management." },
              { icon: "&#9968;", title: "Camp Management", desc: "Theme camp buildout and operations for Burning Man and regional burns. Infrastructure, placement, logistics, and community coordination." },
              { icon: "&#9881;", title: "Infrastructure & Logistics", desc: "Power, water, shade structures, lighting, and the behind-the-scenes systems that make everything run smoothly." },
              { icon: "&#9733;", title: "Creative Direction", desc: "Concept development, environmental design, and art curation. We help shape the story your event tells." },
              { icon: "&#128101;", title: "Community Building", desc: "Membership systems, volunteer coordination, communication platforms, and tools that keep communities connected." },
              { icon: "&#128200;", title: "Strategy & Consulting", desc: "Budget planning, risk management, and operational strategy for organizations scaling their event programs." },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[rgba(43,71,168,0.15)] hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-5" dangerouslySetInnerHTML={{ __html: s.icon }} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="work" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-[#2B47A8] uppercase tracking-[0.15em] mb-3">Portfolio</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Featured Work</h2>
          <p className="text-gray-500 max-w-xl leading-relaxed mb-14">A look at some of the events and communities we&apos;ve helped bring to life.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Swan Forest Camp", sub: "Burning Man \u00B7 Theme Camp \u00B7 Ongoing", icon: "&#127795;", span: true },
              { title: "Feed the Block", sub: "Fremont East \u00B7 Concert Series \u00B7 2025-26", icon: "&#127902;" },
              { title: "Forest House Art Car", sub: "Burning Man + EDC \u00B7 Mobile Stage", icon: "&#127774;" },
              { title: "Corner Bar Management", sub: "Sponsorship Strategy \u00B7 9 Venues", icon: "&#9978;" },
              { title: "Prodigal Swan", sub: "Art Installation \u00B7 Burning Man", icon: "&#127926;" },
            ].map((p) => (
              <div key={p.title} className={`rounded-2xl overflow-hidden relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 transition-transform group ${p.span ? "md:col-span-2 aspect-[21/9]" : ""}`}>
                <span className="text-3xl mb-3 opacity-50" dangerouslySetInnerHTML={{ __html: p.icon }} />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm opacity-80">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section id="clients" className="py-24 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-[#2B47A8] uppercase tracking-[0.15em] mb-3">Clients & Partners</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Who We Work With</h2>
          <p className="text-gray-500 max-w-xl leading-relaxed mb-14">Organizations and communities that trust us to deliver.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Swan Forest Camp", type: "Burning Man Theme Camp" },
              { name: "Corner Bar Mgmt", type: "Hospitality / 9 Venues" },
              { name: "Wynn Nightlife", type: "Feed the Block Partner" },
              { name: "LVCVA", type: "Municipal Sponsor" },
            ].map((c) => (
              <div key={c.name} className="bg-white rounded-2xl p-8 border border-gray-100 text-center hover:border-[rgba(43,71,168,0.15)] hover:shadow-md transition-all">
                <p className="font-bold text-[#2B47A8] text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-2">{c.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-8 bg-gray-900 text-white text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-[#E83B2E] uppercase tracking-[0.15em] mb-3">Let&apos;s Talk</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Build Something?</h2>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">Whether you&apos;re planning a festival, building a camp, or need help with an event of any scale — we&apos;d love to hear about it.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:info@gorunrabbit.com" className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all">info@gorunrabbit.com</a>
            <a href="https://swanforestcamp.com" target="_blank" rel="noopener noreferrer" className="border-2 border-white/25 text-white px-8 py-3 rounded-xl font-semibold hover:border-white transition-all">Swan Forest Camp</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-white/10 py-8 px-8 text-center">
        <p className="text-xs text-white/35">
          &copy; 2026 Go Run Rabbit LLC &middot;{" "}
          <a href="mailto:info@gorunrabbit.com" className="text-white/50 hover:text-white transition-colors">Contact</a>
        </p>
      </footer>
    </div>
  );
}
