"use client";

import Image from "next/image";

export default function LorePage() {
  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative h-[921px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/apache-springs/milky-way.jpg"
            alt="Desert night sky over the Santa Rita Mountains"
            fill
            className="object-cover grayscale brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ce-surface/20 via-transparent to-ce-surface" />
        </div>
        <div className="relative z-10 text-center px-4">
          <p className="font-label text-ce-secondary tracking-[0.5em] mb-4 text-sm">
            ARCHIVE // 001
          </p>
          <h1 className="text-8xl md:text-[12rem] font-headline font-black uppercase tracking-tighter leading-none text-ce-on-surface">
            THE LORE
          </h1>
        </div>
        {/* Technical Coordinates */}
        <div className="absolute bottom-12 right-12 text-right font-label z-10">
          <div className="text-ce-primary-container text-xs tracking-widest mb-1">
            LOCATION_MARKER
          </div>
          <div className="text-ce-on-surface text-xl font-bold tracking-tighter">
            31.6703&deg; N, 110.7410&deg; W
          </div>
          <div className="text-ce-secondary/60 text-[10px] uppercase mt-1">
            SANTA RITA MOUNTAINS // ALT 5,450 FT
          </div>
        </div>
        <div className="absolute bottom-12 left-12 z-10 hidden md:block">
          <div className="w-16 h-16 border border-ce-outline/30 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-ce-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              explore
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Expedition Flow — 3-Day Schedule */}
      <section className="py-32 px-8 md:px-24 bg-ce-surface topo-bg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
              <h2 className="font-headline text-5xl md:text-7xl font-bold uppercase mb-4">
                EXPEDITION FLOW
              </h2>
              <div className="h-1 w-32 bg-ce-primary-container" />
            </div>
            <div className="font-label text-ce-secondary text-sm tracking-widest uppercase">
              Protocol: 72-Hour
            </div>
          </div>

          <div className="space-y-32">
            {/* Day 01: Insertion */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 group">
              <div className="md:col-span-4 flex flex-col justify-between border-l-4 border-ce-primary-container pl-8 py-2">
                <div>
                  <span className="font-label text-ce-primary-container text-sm font-bold block mb-2">
                    PHASE_01
                  </span>
                  <h3 className="font-headline text-4xl font-bold uppercase">
                    DAY 01: INSERTION
                  </h3>
                </div>
                <div className="mt-8 font-label text-ce-on-surface-variant/60 text-xs">
                  STATUS: DEPLOYED
                </div>
              </div>
              <div className="md:col-span-8 space-y-8 font-label">
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">14:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    THE WELCOME // SETTLE IN, COLD DRINKS ON THE PORCH
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">16:30</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    COURSE BRIEFING: MAPS &amp; ELEVATION PROFILES
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">19:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    COMMUNAL SUPPER UNDER THE ARIZONA SKY
                  </span>
                </div>
              </div>
            </div>

            {/* Day 02: The Push */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 group">
              <div className="md:col-span-4 flex flex-col justify-between border-l-4 border-ce-outline pl-8 py-2">
                <div>
                  <span className="font-label text-ce-outline text-sm font-bold block mb-2">
                    PHASE_02
                  </span>
                  <h3 className="font-headline text-4xl font-bold uppercase">
                    DAY 02: THE PUSH
                  </h3>
                </div>
                <div className="mt-8 font-label text-ce-on-surface-variant/60 text-xs">
                  STATUS: ACTIVE
                </div>
              </div>
              <div className="md:col-span-8 space-y-8 font-label">
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">05:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    FIRST LIGHT: COFFEE, FUEL &amp; FINAL PREPARATIONS
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">06:30</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    RUNNERS DEPART: 50K &amp; HALF-MARATHON FROM THE RANCH GATE
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">16:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    RECOVERY &amp; COLD PLUNGE
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">20:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    VICTORY FIRE: FIRESIDE DINNER UNDER THE MILKY WAY
                  </span>
                </div>
              </div>
            </div>

            {/* Day 03: Extraction */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 group">
              <div className="md:col-span-4 flex flex-col justify-between border-l-4 border-ce-outline pl-8 py-2">
                <div>
                  <span className="font-label text-ce-outline text-sm font-bold block mb-2">
                    PHASE_03
                  </span>
                  <h3 className="font-headline text-4xl font-bold uppercase">
                    DAY 03: EXTRACTION
                  </h3>
                </div>
                <div className="mt-8 font-label text-ce-on-surface-variant/60 text-xs">
                  STATUS: FINAL
                </div>
              </div>
              <div className="md:col-span-8 space-y-8 font-label">
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">08:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    EQUINE CONNECTION: GUIDED THERAPY SESSION
                  </span>
                </div>
                <div className="flex items-baseline gap-6 group-hover:translate-x-2 transition-transform">
                  <span className="text-ce-secondary text-lg shrink-0">11:00</span>
                  <span className="text-2xl font-bold tracking-tight uppercase">
                    BRUNCH &amp; FAREWELLS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Origin */}
      <section className="py-32 px-8 md:px-24 bg-ce-surface-lowest border-y border-ce-surface-highest/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <Image
              src="/images/apache-springs/sunset-mountains.jpg"
              alt="Santa Rita Mountains landscape at sunset"
              width={800}
              height={600}
              className="w-full h-[600px] object-cover grayscale brightness-75 transition-all duration-700 group-hover:grayscale-0"
            />
            <div className="absolute -bottom-6 -right-6 bg-ce-primary-container p-8 hidden md:block">
              <span className="font-label text-white text-xs tracking-widest uppercase block mb-1">
                EST. DATA
              </span>
              <span className="font-headline text-4xl font-bold text-white">
                1904
              </span>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <span className="font-label text-ce-primary-container text-sm tracking-[0.3em] font-bold uppercase mb-4 block">
                HISTORICAL CONTEXT
              </span>
              <h2 className="font-headline text-6xl md:text-7xl font-bold uppercase leading-none mb-8">
                THE ORIGIN
              </h2>
            </div>
            <div className="space-y-6 text-ce-on-surface-variant font-body leading-relaxed text-lg">
              <p>
                Apache Springs Ranch sits in the heart of the Santa Rita
                Mountains — a landscape shaped by millennia of geological force
                and centuries of human ambition. The surrounding trails trace
                paths first walked by the Tohono O&apos;odham, later used by
                Spanish missionaries, and eventually by the miners who
                established Kentucky Camp in 1904.
              </p>
              <p>
                Today, the ranch is a sanctuary where that same rugged terrain
                meets quiet luxury. 160 acres of high-desert grassland, oak
                savanna, and sky island ecology — home to longhorns, horses, and
                some of the darkest skies in Arizona.
              </p>
            </div>
            <div className="pt-8 grid grid-cols-2 gap-4">
              <div className="border border-ce-outline/20 p-6">
                <span className="font-label text-ce-secondary text-[10px] block mb-2 uppercase">
                  ECOLOGY
                </span>
                <div className="text-ce-on-surface font-bold text-xl uppercase">
                  Sky Island Biome
                </div>
              </div>
              <div className="border border-ce-outline/20 p-6">
                <span className="font-label text-ce-secondary text-[10px] block mb-2 uppercase">
                  GEOLOGY
                </span>
                <div className="text-ce-on-surface font-bold text-xl uppercase">
                  Santa Rita Gneiss
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Quote */}
      <section className="py-48 px-8 flex flex-col items-center justify-center text-center bg-ce-surface relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden flex items-center justify-center">
          <span className="font-label text-[40rem] font-black">RUN</span>
        </div>
        <div className="max-w-4xl relative z-10">
          <span className="material-symbols-outlined text-ce-primary-container text-6xl mb-12">
            format_quote
          </span>
          <blockquote className="font-headline text-4xl md:text-6xl font-medium italic leading-tight text-ce-on-surface">
            &ldquo;The desert strips away everything that doesn&apos;t matter.
            What&apos;s left is the run, the land, and the people beside
            you.&rdquo;
          </blockquote>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-ce-outline" />
            <cite className="font-label text-ce-secondary uppercase tracking-widest text-sm not-italic font-bold">
              Expedition Director // 2026
            </cite>
            <div className="h-px w-12 bg-ce-outline" />
          </div>
        </div>
      </section>
    </>
  );
}
