import Image from "next/image";
import {
  phases,
  courseStory,
  surfaceBreakdown,
} from "../data/routes";
import RouteMapSVG from "../components/RouteMapSVG";

/* ─── Fixed Nav ─── */

function Nav() {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 md:py-8 bg-br-surface/80 backdrop-blur-sm">
      <div className="text-xl md:text-2xl font-black font-headline tracking-tighter text-br-on-surface">
        Basin &amp; Range
      </div>
      <nav className="hidden md:flex items-center space-x-12">
        <a
          href="#route"
          className="font-headline uppercase tracking-[0.2em] font-bold text-sm text-br-primary border-b-2 border-br-primary pb-1"
        >
          The Route
        </a>
        <a
          href="#map"
          className="font-headline uppercase tracking-[0.2em] font-bold text-sm text-br-on-surface hover:text-br-primary transition-colors duration-300"
        >
          Map
        </a>
        <a
          href="#vision"
          className="font-headline uppercase tracking-[0.2em] font-bold text-sm text-br-on-surface hover:text-br-primary transition-colors duration-300"
        >
          Vision
        </a>
        <a
          href="mailto:hello@basinandrange100.com"
          className="font-headline uppercase tracking-[0.2em] font-bold text-sm text-br-on-surface hover:text-br-primary transition-colors duration-300"
        >
          Contact
        </a>
      </nav>
      <a
        href="mailto:hello@basinandrange100.com"
        className="font-headline uppercase tracking-[0.2em] font-bold text-sm px-8 py-3 bg-br-primary text-br-on-primary hover:brightness-110 transition-all hidden md:block"
      >
        Get in Touch
      </a>
    </header>
  );
}

/* ─── 1. Hero ─── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/basin-and-range/images/desert-mountains.jpg"
          alt="Red Rock Canyon escarpment at dusk"
          fill
          className="object-cover object-[center_30%] grayscale opacity-60"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-br-surface via-br-surface/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl pt-20">
        <h1 className="font-headline text-6xl md:text-[120px] leading-[0.9] font-black tracking-tighter mb-6">
          Basin
          <br />
          <span className="text-br-primary">&amp; Range</span>
        </h1>
        <p className="font-headline tracking-[0.3em] text-xl md:text-2xl mb-4 text-br-on-surface-variant uppercase">
          100 Mile Desert Ultra
        </p>
        <p className="font-headline tracking-[0.2em] text-sm md:text-base mb-12 text-br-outline uppercase">
          Red Rock Canyon &rarr; Henderson &rarr; Boulder City
        </p>
        <div className="flex flex-col md:flex-row gap-6">
          <a
            href="#route"
            className="bg-br-primary text-br-on-primary px-12 py-5 font-bold tracking-widest text-sm uppercase hover:brightness-110 transition-all text-center"
          >
            View the Route
          </a>
          <a
            href="#map"
            className="border border-br-primary/30 text-br-primary px-12 py-5 font-bold tracking-widest text-sm uppercase hover:bg-br-primary/10 transition-colors text-center"
          >
            Explore Map
          </a>
        </div>
      </div>

      {/* Horizontal gold rule — Stitch detail */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-br-primary/30 to-transparent" />
    </section>
  );
}

/* ─── 2. Concept Overview ─── */

function ConceptOverview() {
  return (
    <section className="py-32 px-6 md:px-12 bg-br-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h2 className="text-br-primary text-sm tracking-[0.4em] font-bold font-headline mb-2">
            Concept Overview
          </h2>
          <div className="w-12 h-1 bg-br-primary mb-8" />
          <p className="text-3xl md:text-5xl font-light leading-snug text-br-on-surface-variant">
            100 miles through Southern Nevada&rsquo;s basin &amp; range terrain.
            Sandstone, volcanic ridgelines, and a finish through five
            Hoover Dam&ndash;era railroad tunnels.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "108", unit: "mi", label: "Total Distance" },
            { value: "15K", unit: "ft", label: "Vertical Gain" },
            { value: "65", unit: "%", label: "Dirt Singletrack" },
            { value: "8", unit: "", label: "Route Phases" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-br-surface-container p-8 md:p-10 flex flex-col justify-between aspect-square border-l-4 border-br-primary"
            >
              <span className="text-br-primary text-5xl md:text-6xl font-black font-headline">
                {stat.value}
                {stat.unit && (
                  <span className="text-xl font-normal text-br-outline ml-1">
                    {stat.unit}
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-br-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Route Phases ─── */

function RoutePhases() {
  return (
    <section id="route" className="py-32 bg-br-surface-lowest scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-center text-4xl md:text-6xl font-black font-headline mb-4 tracking-tighter">
          The Phases
        </h2>
        <div className="w-12 h-1 bg-br-primary mx-auto mb-24" />

        <div className="space-y-px bg-br-outline-variant/10">
          {phases.map((phase, i) => (
            <div
              key={i}
              className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-br-surface-container p-8 md:p-12 hover:bg-br-surface-high transition-all duration-500 border-l-4 border-transparent hover:border-br-primary"
            >
              <div className="flex items-start md:items-center gap-8 md:gap-12">
                <span className="text-5xl md:text-6xl font-black font-headline text-br-surface-highest group-hover:text-br-primary transition-colors duration-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-headline tracking-tight">
                    {phase.title}
                  </h3>
                  <p className="text-br-outline text-xs tracking-widest mt-2 uppercase">
                    {phase.surface}
                  </p>
                  <p className="text-sm text-br-secondary leading-relaxed mt-4 max-w-xl hidden md:block">
                    {phase.description}
                  </p>
                  <ul className="mt-3 space-y-1 hidden lg:block">
                    {phase.trails.map((trail, j) => (
                      <li
                        key={j}
                        className="text-br-outline text-xs tracking-wide"
                      >
                        {trail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:text-right shrink-0">
                <div className="text-br-primary font-black font-headline text-xl">
                  {phase.miles} mi
                </div>
                <div className="text-[10px] tracking-widest text-br-outline uppercase mt-1">
                  {phase.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Surface Breakdown ─── */

function SurfaceBreakdown() {
  return (
    <section className="py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm tracking-[0.5em] font-bold font-headline text-br-primary mb-2 text-center">
          Surface Architecture
        </h2>
        <div className="w-12 h-1 bg-br-primary mx-auto mb-16" />

        <div className="space-y-10">
          {surfaceBreakdown.map((s, i) => (
            <div key={s.label}>
              <div className="flex justify-between items-end mb-3">
                <span className="font-headline font-bold uppercase tracking-wider text-xs">
                  {s.label}
                </span>
                <span
                  className={`font-headline font-black text-lg ${
                    i === 0 ? "text-br-primary" : "text-br-on-surface"
                  }`}
                >
                  {s.percent}%
                </span>
              </div>
              <div className="h-4 bg-br-surface-highest">
                <div
                  className={`h-full ${
                    i === 0
                      ? "bg-br-primary"
                      : i === 1
                      ? "bg-br-secondary"
                      : i === 2
                      ? "bg-outline"
                      : "bg-br-outline-variant"
                  }`}
                  style={{ width: `${s.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Course Story ─── */

function CourseStory() {
  return (
    <section className="py-32 bg-br-surface-lowest relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative">
        {/* Center line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-br-outline-variant/30 md:-translate-x-1/2" />

        <div className="space-y-32 md:space-y-40">
          {courseStory.map((stage, i) => (
            <div
              key={i}
              className="relative flex flex-col md:flex-row gap-12 pl-14 md:pl-0"
            >
              {/* Square marker */}
              <div className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 w-[9px] h-[9px] bg-br-primary z-10 hidden md:block" />
              <div className="absolute left-[20px] top-[5px] w-[9px] h-[9px] bg-br-primary md:hidden" />

              <div
                className={`w-full md:w-1/2 ${
                  i % 2 === 1 ? "md:ml-auto" : ""
                }`}
              >
                {stage.image && (
                  <Image
                    src={stage.image}
                    alt={stage.imageAlt || stage.title}
                    width={800}
                    height={450}
                    className="w-full aspect-[4/3] object-cover mb-8 grayscale hover:grayscale-0 transition-all duration-700"
                    quality={80}
                  />
                )}
                <p className="text-br-primary text-[10px] tracking-[0.3em] font-bold uppercase mb-3">
                  {stage.label}
                </p>
                <h3 className="text-2xl md:text-3xl font-black font-headline mb-4">
                  {stage.title}
                </h3>
                <p className="text-br-on-surface-variant font-light leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 6. Map Section ─── */

function MapSection() {
  return (
    <section id="map" className="py-32 px-6 md:px-12 bg-br-surface scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-4xl md:text-6xl font-black font-headline mb-4 tracking-tighter">
          The Corridor
        </h2>
        <div className="w-12 h-1 bg-br-primary mx-auto mb-16" />

        <div className="border border-br-primary/10 p-1 bg-br-surface-low relative overflow-hidden">
          {/* Dot grid — Stitch detail */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#e5c276 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10">
            <RouteMapSVG />
          </div>
        </div>

        <p className="text-br-outline text-[10px] tracking-widest uppercase font-bold mt-8 text-center">
          Conceptual route visualization &middot; Trail-snapped GPS track in
          progress
        </p>
      </div>
    </section>
  );
}

/* ─── 7. Experience — Why the Desert ─── */

function Experience() {
  const points = [
    {
      title: "Winter Race Calendar",
      text: "Late-season conditions offer the perfect thermal window for high-effort endurance in the high desert.",
    },
    {
      title: "Airport Access",
      text: "Direct international connections to Harry Reid International, 20 minutes from the start line.",
    },
    {
      title: "Hospitality Infrastructure",
      text: "150,000+ hotel rooms. World-class recovery and accommodation for athletes and support crews.",
    },
    {
      title: "Crew Access",
      text: "Logistically optimized route with multiple road-accessible points for family and support teams.",
    },
    {
      title: "Boulder City Finish",
      text: "A historic finish setting that captures the heritage of the American Southwest.",
    },
    {
      title: "Content & Sponsorship",
      text: "Desert light, iconic terrain, and a Vegas dateline create the ultimate stage for endurance storytelling.",
    },
  ];

  return (
    <section id="vision" className="py-32 scroll-mt-20">
      {/* Full-bleed banner */}
      <div className="w-full h-96 relative mb-24">
        <Image
          src="/basin-and-range/images/runners-desert-trail.jpg"
          alt="Trail runners on a desert path toward the mountains"
          fill
          className="object-cover grayscale"
          quality={80}
        />
        <div className="absolute inset-0 bg-br-surface/60 flex items-center justify-center">
          <h2 className="text-4xl md:text-7xl font-black font-headline tracking-tighter">
            Why the Desert?
          </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-br-outline-variant/10">
        {points.map((p) => (
          <div
            key={p.title}
            className="bg-br-surface-container p-12 hover:bg-br-primary/5 transition-colors"
          >
            <h4 className="text-br-primary font-black font-headline mb-4">
              {p.title}
            </h4>
            <p className="text-br-on-surface-variant text-sm leading-relaxed font-light">
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 8. Race Weekend Vision ─── */

function RaceWeekend() {
  const left = [
    {
      title: "Runner Village",
      text: "A minimalist basecamp focused on precision preparation. Gear check, shakeout runs, pre-race briefing.",
    },
    {
      title: "Start Line",
      text: "Red Rock Canyon. Pre-dawn silence. A stripped-down, high-stakes launch into the basin & range.",
    },
    {
      title: "Finish Festival",
      text: "Boulder City. Live tracking boards, crew reunions, local vendors, and a finish through the railroad tunnels.",
    },
  ];

  const right = [
    {
      title: "Film & Content",
      text: "Embedded film crew documenting the inaugural journey. Desert light and terrain that practically shoots itself.",
    },
    {
      title: "Elite Field",
      text: "A course profile and desert identity compelling enough to attract serious competitive depth.",
    },
    {
      title: "Future Distances",
      text: "Year-one is the 100-mile flagship. Companion 100K, 50M, and marathon distances expand in subsequent editions.",
    },
  ];

  return (
    <section className="py-32 bg-br-surface-lowest">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-center text-4xl md:text-6xl font-black font-headline mb-4 tracking-tighter">
          Race Weekend
        </h2>
        <div className="w-12 h-1 bg-br-primary mx-auto mb-24" />

        {/* Boulder City finish area */}
        <div className="bg-br-surface-highest border-t-2 border-br-primary p-8 md:p-12 mb-24">
          <h3 className="font-headline font-black uppercase tracking-widest text-lg mb-4">
            The Boulder City Finish
          </h3>
          <p className="text-sm text-br-secondary leading-relaxed mb-6 max-w-2xl">
            A town built to house the workers who built Hoover Dam. Historic
            downtown, local breweries, and the kind of finish-line character
            that runners come back to year after year.
          </p>
          <Image
            src="/basin-and-range/images/railroad-tracks-dusk.jpg"
            alt="Railroad tracks curving through the desert at dusk near Boulder City"
            width={1600}
            height={600}
            className="w-full aspect-video object-cover object-bottom grayscale hover:grayscale-0 transition-all duration-700"
            quality={80}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-16">
            {left.map((el) => (
              <div key={el.title}>
                <h3 className="text-br-primary text-2xl md:text-3xl font-black font-headline mb-4">
                  {el.title}
                </h3>
                <p className="text-br-on-surface-variant leading-relaxed">
                  {el.text}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-16">
            {right.map((el) => (
              <div key={el.title}>
                <h3 className="text-br-primary text-2xl md:text-3xl font-black font-headline mb-4">
                  {el.title}
                </h3>
                <p className="text-br-on-surface-variant leading-relaxed">
                  {el.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 9. Permitting ─── */

function Permitting() {
  return (
    <section className="py-20 bg-br-surface">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-br-outline text-[10px] tracking-[0.2em] uppercase font-bold leading-loose">
          Basin &amp; Range is currently in the route validation and planning
          phase. Final course design requires agency coordination, environmental
          review, and jurisdictional approvals across BLM, NPS, City of
          Henderson, Boulder City, and Clark County. We honor the land and leave
          no trace.
        </p>
      </div>
    </section>
  );
}

/* ─── 10. Final CTA ─── */

function FinalCTA() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/basin-and-range/images/desert-sunrise.jpg"
          alt="Desert horizon at sunrise"
          fill
          className="object-cover grayscale opacity-40"
          quality={80}
        />
        <div className="absolute inset-0 bg-br-surface/80" />
      </div>
      <div className="relative z-10 max-w-4xl">
        <h2 className="text-5xl md:text-8xl font-black font-headline mb-12 tracking-tighter">
          A New Desert
          <br />
          <span className="text-br-primary">Classic</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <a
            href="mailto:hello@basinandrange100.com"
            className="bg-br-primary text-br-on-primary px-8 md:px-16 py-5 md:py-6 font-black tracking-widest text-sm md:text-lg uppercase hover:brightness-110 transition-all"
          >
            Get in Touch
          </a>
          <a
            href="#route"
            className="border border-br-on-surface/20 text-br-on-surface px-8 md:px-16 py-5 md:py-6 font-black tracking-widest text-sm md:text-lg uppercase hover:bg-br-on-surface/5 transition-colors"
          >
            Review the Route
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="w-full px-6 md:px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-8 bg-br-surface-lowest border-t border-br-surface-highest/10">
      <span className="font-headline font-bold text-br-primary text-2xl tracking-[0.3em]">
        BASIN &amp; RANGE
      </span>
      <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
        <a
          href="#route"
          className="uppercase tracking-[0.2em] text-[10px] font-medium text-br-secondary/50 hover:text-br-primary transition-colors"
        >
          Route
        </a>
        <a
          href="#map"
          className="uppercase tracking-[0.2em] text-[10px] font-medium text-br-secondary/50 hover:text-br-primary transition-colors"
        >
          Map
        </a>
        <a
          href="mailto:hello@basinandrange100.com"
          className="uppercase tracking-[0.2em] text-[10px] font-medium text-br-secondary/50 hover:text-br-primary transition-colors"
        >
          Contact
        </a>
      </nav>
      <p className="uppercase tracking-[0.2em] text-[10px] font-medium text-br-secondary/50 text-center">
        &copy; 2026 Basin &amp; Range. A concept.
      </p>
    </footer>
  );
}

/* ─── Page ─── */

export default function BasinRangeContent() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ConceptOverview />
        <RoutePhases />
        <SurfaceBreakdown />
        <CourseStory />
        <MapSection />
        <Experience />
        <RaceWeekend />
        <Permitting />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
