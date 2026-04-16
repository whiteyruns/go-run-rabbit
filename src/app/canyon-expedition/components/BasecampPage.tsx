"use client";

import Image from "next/image";

export default function BasecampPage() {
  return (
    <>
      {/* ── Compact Hero ── */}
      <section className="relative h-[716px] w-full overflow-hidden">
        {/* Topo background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100 M0 200 Q 150 180 300 220 T 600 200 T 800 220 M0 300 Q 250 250 500 320 T 800 300' stroke='%23363433' fill='none' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: "cover",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ce-surface via-transparent to-transparent z-10" />
        {/* Background image */}
        <Image
          src="/images/apache-springs/mountains-panorama.jpg"
          alt="dramatic high-altitude aerial view of a rugged desert canyon landscape"
          fill
          className="object-cover grayscale opacity-60 contrast-125"
          priority
        />
        {/* Content */}
        <div className="absolute bottom-12 left-8 md:left-16 z-20 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-ce-primary-container" />
            <span className="font-label text-xs tracking-tighter text-ce-secondary uppercase">
              Site // 31.6703° N, 110.7410° W
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none mb-4">
            The Basecamp
          </h1>
          <p className="font-label text-xl tracking-tight text-ce-primary uppercase">
            160 Acres in the Santa Rita Mountains.
          </p>
        </div>
      </section>

      {/* ── Two-Column Narrative ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-ce-surface-lowest">
        {/* Text column */}
        <div className="flex flex-col justify-center p-8 md:p-24 space-y-8 order-2 md:order-1">
          <div className="space-y-2">
            <span className="font-label text-xs text-ce-primary-container font-bold uppercase tracking-[0.2em]">
              The Ranch
            </span>
            <h2 className="text-4xl md:text-5xl font-headline italic font-light leading-tight">
              Where Rugged Meets Refined
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ce-on-surface-variant max-w-lg">
            Apache Springs Ranch is not a race venue &mdash; it is a sanctuary.
            Set on 160 acres where desert grit meets quiet luxury, the ranch is
            home to horses, longhorns, and some of the darkest skies in Arizona.
            Twenty runners. Communal dining. Fireside conversation under the
            Milky Way.
          </p>
          <div className="pt-8 border-t border-ce-outline-variant/20 flex flex-col space-y-4">
            <div className="flex justify-between items-end">
              <span className="font-label text-xs uppercase text-ce-on-surface/60">
                Dark Sky Rating
              </span>
              <span className="font-label text-xl text-ce-secondary">
                Bortle Class 2
              </span>
            </div>
            <div className="w-full h-1 bg-ce-surface-highest">
              <div className="w-[90%] h-full bg-ce-primary-container" />
            </div>
          </div>
        </div>
        {/* Image column */}
        <div className="relative h-[614px] md:h-auto overflow-hidden order-1 md:order-2">
          <Image
            src="/images/apache-springs/great-room.jpg"
            alt="Ranch great room with communal living space"
            fill
            className="object-cover contrast-150 saturate-50"
          />
          <div className="absolute inset-0 bg-ce-surface/20 mix-blend-multiply" />
        </div>
      </section>

      {/* ── Technical Specifications ── */}
      <section className="py-24 px-8 md:px-16 bg-ce-surface">
        <div className="mb-16">
          <h3 className="font-headline text-3xl uppercase tracking-widest mb-2">
            Technical Specifications
          </h3>
          <div className="h-px w-24 bg-ce-primary-container" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ce-outline-variant/20 border border-ce-outline-variant/20">
          {/* Card 1 — The Lodge */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              house
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              The Lodge
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              Spacious communal living with modern amenities. Shared rooms, hot
              showers, comfortable beds, and a great room that opens to the
              desert.
            </p>
          </div>
          {/* Card 2 — Spring-Fed Pond */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              water_drop
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              Spring-Fed Pond
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              Private pond with dock, surrounded by mesquite and cottonwood. A
              quiet retreat between runs.
            </p>
          </div>
          {/* Card 3 — Equine Program */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              cruelty_free
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              Equine Program
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              Guided equine therapy sessions with the ranch horses. Donkeys,
              longhorns, and mustangs call this land home.
            </p>
          </div>
          {/* Card 4 — Outdoor Kitchen */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              restaurant
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              Outdoor Kitchen
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              All meals chef-prepared and communal. Local ingredients, runner
              nutrition, and celebratory dinners under the stars.
            </p>
          </div>
          {/* Card 5 — Recovery Station */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              self_improvement
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              Recovery Station
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              Post-run recovery sessions, cold plunge, stretching, and time to
              decompress in the high desert air.
            </p>
          </div>
          {/* Card 6 — Dark Sky Sanctuary */}
          <div className="bg-ce-surface-low p-10 hover:bg-ce-surface-bright transition-all group">
            <span className="material-symbols-outlined text-4xl text-ce-primary mb-6 group-hover:scale-110 transition-transform inline-block">
              star
            </span>
            <h4 className="font-label text-lg font-bold uppercase mb-2">
              Dark Sky Sanctuary
            </h4>
            <p className="text-sm text-ce-on-surface-variant font-light leading-relaxed">
              Bortle Class 2 skies. The Milky Way stretches horizon to horizon.
              Bring a camera.
            </p>
          </div>
        </div>
      </section>

      {/* ── Image Strip ── */}
      <section className="flex flex-col md:flex-row h-[614px] w-full gap-0 overflow-hidden">
        {/* 01 — The Lodge */}
        <div className="flex-1 overflow-hidden relative group cursor-crosshair">
          <Image
            src="/images/apache-springs/great-room.jpg"
            alt="Ranch great room with communal living space"
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
          />
          <div className="absolute bottom-4 left-4 bg-ce-surface px-2 py-1 font-label text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            01 // THE LODGE
          </div>
        </div>
        {/* 02 — The Herd */}
        <div className="flex-1 overflow-hidden relative group cursor-crosshair">
          <Image
            src="/images/apache-springs/horses-running.jpg"
            alt="Horses running on the ranch"
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
          />
          <div className="absolute bottom-4 left-4 bg-ce-surface px-2 py-1 font-label text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            02 // THE HERD
          </div>
        </div>
        {/* 03 — The Sky */}
        <div className="flex-1 overflow-hidden relative group cursor-crosshair">
          <Image
            src="/images/apache-springs/milky-way.jpg"
            alt="Milky Way over Apache Springs Ranch"
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
          />
          <div className="absolute bottom-4 left-4 bg-ce-surface px-2 py-1 font-label text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            03 // THE SKY
          </div>
        </div>
        {/* 04 — The Land */}
        <div className="flex-1 overflow-hidden relative group cursor-crosshair">
          <Image
            src="/images/apache-springs/pond-landscape.jpg"
            alt="Ranch pond and desert landscape"
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
          />
          <div className="absolute bottom-4 left-4 bg-ce-surface px-2 py-1 font-label text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            04 // THE LAND
          </div>
        </div>
      </section>

      {/* ── Tactical Proximity ── */}
      <section className="py-24 px-8 md:px-16 bg-ce-surface-lowest grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — distances */}
        <div className="space-y-12">
          <div>
            <h3 className="font-headline text-4xl uppercase tracking-tighter mb-4">
              Tactical Proximity
            </h3>
            <p className="text-ce-on-surface-variant font-light">
              Apache Springs Ranch is one hour south of Tucson in the Santa Rita
              Mountains. We recommend flying into Tucson International. Shuttle
              service can be arranged.
            </p>
          </div>
          <div className="space-y-6">
            {/* Phoenix */}
            <div className="flex justify-between items-center border-b border-ce-outline-variant/10 pb-4">
              <div className="space-y-1">
                <span
                  className="font-label text-[10px] uppercase"
                  style={{ color: "#ffddae" }}
                >
                  Destination
                </span>
                <p className="font-headline text-xl">Phoenix Sky Harbor</p>
              </div>
              <div className="text-right">
                <span className="font-label text-[10px] text-ce-primary uppercase tracking-widest">
                  Travel Time
                </span>
                <p className="font-label text-2xl">02:30:00</p>
              </div>
            </div>
            {/* Tucson */}
            <div className="flex justify-between items-center border-b border-ce-outline-variant/10 pb-4">
              <div className="space-y-1">
                <span
                  className="font-label text-[10px] uppercase"
                  style={{ color: "#ffddae" }}
                >
                  Destination
                </span>
                <p className="font-headline text-xl">Tucson International</p>
              </div>
              <div className="text-right">
                <span className="font-label text-[10px] text-ce-primary uppercase tracking-widest">
                  Travel Time
                </span>
                <p className="font-label text-2xl">01:00:00</p>
              </div>
            </div>
            {/* Sonoita */}
            <div className="flex justify-between items-center border-b border-ce-outline-variant/10 pb-4">
              <div className="space-y-1">
                <span
                  className="font-label text-[10px] uppercase"
                  style={{ color: "#ffddae" }}
                >
                  Destination
                </span>
                <p className="font-headline text-xl">
                  Sonoita, AZ (nearest town)
                </p>
              </div>
              <div className="text-right">
                <span className="font-label text-[10px] text-ce-primary uppercase tracking-widest">
                  Travel Time
                </span>
                <p className="font-label text-2xl">00:20:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — decorative map */}
        <div className="relative aspect-square w-full bg-ce-surface border border-ce-outline-variant/30 flex items-center justify-center overflow-hidden">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #f7600c 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Map content */}
          <div className="relative z-10 w-full h-full p-8">
            <div className="absolute inset-8 border border-ce-primary-container/40 flex items-center justify-center">
              <div className="text-center">
                <div className="w-4 h-4 bg-ce-primary-container mb-2 mx-auto animate-pulse" />
                <span className="font-label text-xs uppercase tracking-widest text-ce-on-surface">
                  Apache Springs
                </span>
              </div>
            </div>
            {/* SVG topo lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 400"
            >
              <path
                d="M50,100 C150,50 250,150 350,100"
                fill="none"
                opacity="0.3"
                stroke="#f5bd64"
                strokeWidth="0.5"
              />
              <path
                d="M50,200 C150,150 250,250 350,200"
                fill="none"
                opacity="0.3"
                stroke="#f5bd64"
                strokeWidth="0.5"
              />
              <path
                d="M50,300 C150,250 250,350 350,300"
                fill="none"
                opacity="0.3"
                stroke="#f5bd64"
                strokeWidth="0.5"
              />
              <circle
                cx="200"
                cy="200"
                fill="none"
                opacity="0.4"
                r="100"
                stroke="#f7600c"
                strokeDasharray="4"
                strokeWidth="0.5"
              />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
