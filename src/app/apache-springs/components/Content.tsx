"use client";

import { useState } from "react";
import Image from "next/image";

/* ─── Types ─── */

type FaqItem = { q: string; a: string };
type FaqCategory = { category: string; items: FaqItem[] };

/* ─── Data ─── */

const galleryImages = [
  { src: "ranch-gate.jpg", alt: "Apache Springs ranch gate" },
  { src: "sunset-mountains.jpg", alt: "Sunset over the Santa Rita Mountains" },
  { src: "trail-sunset.jpg", alt: "Trail at sunset" },
  { src: "mountains-panorama.jpg", alt: "Mountain panorama" },
  { src: "trail-ridgeline.jpg", alt: "Trail along the ridgeline" },
  { src: "red-canyon.jpg", alt: "Red canyon walls" },
  { src: "pond-dock.png", alt: "Pond with dock" },
  { src: "donkeys.png", alt: "Donkeys at the ranch" },
  { src: "longhorn.png", alt: "Longhorn cattle" },
  { src: "horse-field.png", alt: "Horse in the field" },
  { src: "horse-portrait.jpg", alt: "Horse portrait" },
  { src: "horses-running.jpg", alt: "Horses running" },
  { src: "bedroom.jpg", alt: "Ranch bedroom" },
  { src: "living-room.jpg", alt: "Ranch living room" },
  { src: "game-room.jpg", alt: "Game room" },
  { src: "great-room.jpg", alt: "Great room" },
  { src: "barn-arena.jpg", alt: "Barn and arena" },
  { src: "pond-landscape.jpg", alt: "Pond landscape" },
  { src: "milky-way.jpg", alt: "Milky Way over the ranch" },
];

const faqData: FaqCategory[] = [
  {
    category: "Getting There",
    items: [
      {
        q: "Where is Apache Springs Ranch?",
        a: "Apache Springs Ranch is located in the Santa Rita Mountains of Southern Arizona, approximately one hour south of Tucson.",
      },
      {
        q: "What are the nearest airports?",
        a: "Tucson International Airport (TUS) is approximately 1 hour away. Phoenix Sky Harbor (PHX) is approximately 2.5 hours away. We recommend flying into Tucson for the most convenient access.",
      },
      {
        q: "Is transportation provided from the airport?",
        a: "We can arrange shuttle service from Tucson International Airport. Details will be provided upon confirmation of your place.",
      },
    ],
  },
  {
    category: "The Ranch",
    items: [
      {
        q: "What is the accommodation like?",
        a: "Apache Springs Ranch spans 160 acres with comfortable lodging for up to 20 runners. Rooms are shared but spacious, with modern amenities including hot showers, comfortable beds, and communal living spaces.",
      },
      {
        q: "Is there cell service at the ranch?",
        a: "Cell service is limited on the ranch. Wi-Fi is available in the main lodge. We encourage runners to embrace the disconnect.",
      },
    ],
  },
  {
    category: "The Runs",
    items: [
      {
        q: "What are the run options?",
        a: "Two curated routes: the 50K Ultra (32.5 miles through the Coronado National Forest) and Passage 5 (13.8 miles along the Arizona Trail through the Santa Rita Mountains). Both start and finish at the ranch.",
      },
      {
        q: "What is the elevation profile like?",
        a: "The 50K features 4,784 feet of climbing with elevations ranging from 4,800 to 6,000 feet. Passage 5 is more moderate but still includes meaningful elevation change through the Santa Ritas.",
      },
      {
        q: "Are there aid stations?",
        a: "Yes. Aid stations are positioned at key junctions along both routes, stocked with water, electrolytes, and real food. Crew access is limited due to the backcountry terrain.",
      },
    ],
  },
  {
    category: "The Gear",
    items: [
      {
        q: "What gear do I need?",
        a: "Trail running shoes with good grip, a hydration pack (minimum 2L capacity), a headlamp for the pre-dawn start, sun protection, and layers for the desert temperature swing. A GPS device is strongly recommended for the 50K route. A full gear list will be provided upon registration.",
      },
    ],
  },
  {
    category: "The Goods",
    items: [
      {
        q: "What is included in the experience?",
        a: "Everything. Lodging, all meals and beverages, run entry and course support, aid stations, recovery sessions, equine therapy, fireside dinners, and the finisher kit. The only things not included are airfare and personal gear.",
      },
      {
        q: "What are the meals like?",
        a: "All meals are communal and chef-prepared, emphasizing local ingredients and proper runner nutrition. Pre-run fuel, on-course nutrition, and a celebratory dinner are all part of the experience.",
      },
    ],
  },
  {
    category: "Membership & Exclusivity",
    items: [
      {
        q: "How do I get an invitation?",
        a: "Apache Springs is invite-only, limited to 20 runners per event. Submit an expression of interest through this page, and our team will review your application. Priority is given to returning runners, referrals, and those who embody the spirit of the event.",
      },
      {
        q: "Can I bring a non-running guest?",
        a: "The experience is designed specifically for runners. However, we may accommodate a limited number of non-running partners on a case-by-case basis. Please mention this in your registration.",
      },
    ],
  },
];

const scheduleData = [
  {
    day: "Day 1",
    title: "Arrival & Orientation",
    events: [
      { time: "14:00", name: "The Welcome", desc: "Arrive at the ranch, settle into your quarters, and meet your fellow runners over cold drinks on the porch." },
      { time: "16:30", name: "Course Deep Dive", desc: "Detailed course briefing with maps, elevation profiles, and strategy discussion for both routes." },
      { time: "19:00", name: "Communal Supper", desc: "Chef-prepared dinner under the Arizona sky. Stories, strategy, and the calm before the storm." },
    ],
  },
  {
    day: "Day 2",
    title: "Run Day & Recovery",
    events: [
      { time: "05:00", name: "The Dawn Ascent", desc: "Coffee, fuel, and final preparations as the desert sky begins to glow." },
      { time: "06:30", name: "Runners Depart", desc: "Both the 50K Ultra and Passage 5 routes begin from the ranch gate." },
      { time: "16:00", name: "Recovery & Spa", desc: "Post-run recovery sessions, cold plunge, stretching, and time to decompress." },
      { time: "20:00", name: "Victory Fire", desc: "Fireside dinner and celebration under the Milky Way." },
    ],
  },
  {
    day: "Day 3",
    title: "Explore & Depart",
    events: [
      { time: "08:00", name: "Equine Connection", desc: "A guided equine therapy session — connect with the horses that call this land home." },
      { time: "11:00", name: "The Final Farewells", desc: "Brunch, goodbyes, and departure. Shuttle service available to Tucson." },
    ],
  },
];

const includedItems = [
  { icon: "home_pin", title: "Lodging", desc: "Three nights at the ranch" },
  { icon: "restaurant", title: "All Meals", desc: "Chef-prepared, communal dining" },
  { icon: "confirmation_number", title: "Run Entry & Support", desc: "Full course support and timing" },
  { icon: "medical_services", title: "Aid Stations", desc: "Stocked at key junctions" },
  { icon: "self_improvement", title: "Recovery Sessions", desc: "Post-run recovery and cold plunge" },
  { icon: "cruelty_free", title: "Equine Therapy", desc: "Guided session with ranch horses" },
  { icon: "fireplace", title: "Fireside Dinners", desc: "Under the Arizona sky" },
  { icon: "stars", title: "The Finisher Kit", desc: "Custom gear for every finisher", highlight: true },
];

/* ─── Helpers ─── */

const serif = { fontFamily: "var(--font-serif)" };
const body = { fontFamily: "var(--font-body)" };
const img = (name: string) => `/images/apache-springs/${name}`;

/* ─── Nav ─── */

function Nav() {
  return (
    <header
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4"
      style={{
        background: "rgba(22, 19, 16, 0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <a
        href="#hero"
        className="text-xl md:text-2xl font-light italic text-orange-200"
        style={serif}
      >
        Apache Springs
      </a>
      <nav className="hidden md:flex items-center space-x-10">
        {[
          ["The Ranch", "#ranch"],
          ["Routes", "#routes"],
          ["Schedule", "#schedule"],
          ["Gallery", "#gallery"],
          ["FAQ", "#faq"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="italic text-sm text-stone-300 hover:text-orange-400 transition-colors duration-300"
            style={serif}
          >
            {label}
          </a>
        ))}
      </nav>
      <a
        href="#register"
        className="hidden md:block text-sm font-semibold px-6 py-2.5 transition-all hover:brightness-110"
        style={{
          ...body,
          background: "linear-gradient(135deg, #ffb688, #ce7c44)",
          color: "#512400",
          borderRadius: "2px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Register Interest
      </a>
    </header>
  );
}

/* ─── 1. Hero ─── */

function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={img("ranch-gate.jpg")}
          alt="Apache Springs ranch gate"
          fill
          className="object-cover opacity-50"
          priority
          quality={85}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #161310 0%, rgba(22,19,16,0.4) 50%, transparent 100%)",
          }}
        />
      </div>
      <div className="relative z-10 max-w-4xl">
        <h1
          className="text-6xl md:text-8xl font-light italic mb-6 text-glow"
          style={{ ...serif, color: "#ffb688" }}
        >
          Apache Springs
        </h1>
        <p
          className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ ...body, color: "#d9c2b5" }}
        >
          An invite-only ultramarathon and retreat in the Santa Rita Mountains of
          Southern Arizona. Three days. Twenty runners. One hundred sixty acres.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#register"
            className="px-10 py-4 text-sm uppercase tracking-widest font-semibold transition-all hover:brightness-110"
            style={{
              ...body,
              background: "linear-gradient(135deg, #ffb688, #ce7c44)",
              color: "#512400",
              borderRadius: "2px",
            }}
          >
            Register Interest
          </a>
          <a
            href="#routes"
            className="px-10 py-4 text-sm uppercase tracking-widest font-semibold transition-colors"
            style={{
              ...body,
              border: "1px solid rgba(255,182,136,0.3)",
              color: "#ffb688",
              borderRadius: "2px",
            }}
          >
            Explore Routes
          </a>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-stone-500">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
}

/* ─── 2. Stats Bar ─── */

function StatsBar() {
  const stats = [
    { value: "160", label: "Acres" },
    { value: "50K + 13.8 mi", label: "Two Routes" },
    { value: "3", label: "Days" },
    { value: "20", label: "Runners" },
  ];
  return (
    <section style={{ background: "var(--color-surface-low)" }}>
      <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <div
              className="text-3xl md:text-4xl font-light italic"
              style={{ ...serif, color: "var(--color-primary)" }}
            >
              {s.value}
            </div>
            <div
              className="text-xs uppercase tracking-widest mt-2"
              style={{ ...body, color: "var(--color-outline)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 3. Where Rugged Meets Refined ─── */

function RanchIntro() {
  return (
    <section id="ranch" className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <h2
            className="text-3xl md:text-4xl font-light italic mb-6"
            style={{ ...serif, color: "var(--color-secondary)" }}
          >
            Where Rugged
            <br />
            Meets Refined
          </h2>
          <p
            className="text-base leading-relaxed mb-4"
            style={{ ...body, color: "var(--color-on-surface-variant)" }}
          >
            Apache Springs is not a race. It is a retreat for runners who want
            more than a finish line. Set on 160 acres in Arizona&apos;s Santa
            Rita Mountains, the ranch is a sanctuary where desert grit meets
            quiet luxury — trail running by day, fireside conversation by night.
          </p>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ ...body, color: "var(--color-on-surface-variant)" }}
          >
            Twenty runners. Two curated routes. Three days of running, recovery,
            and connection in one of the most beautiful landscapes in the
            American Southwest.
          </p>
          <a
            href="#gallery"
            className="italic text-sm hover:text-orange-400 transition-colors"
            style={{ ...serif, color: "var(--color-primary)" }}
          >
            Explore the ranch &rarr;
          </a>
        </div>
        <div className="md:col-span-7 grid grid-cols-12 gap-3">
          <div className="col-span-8 relative aspect-[4/3]">
            <Image
              src={img("trail-sunset.jpg")}
              alt="Trail at sunset"
              fill
              className="object-cover"
              quality={80}
            />
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <div className="relative aspect-square">
              <Image
                src={img("great-room.jpg")}
                alt="Ranch great room"
                fill
                className="object-cover"
                quality={80}
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src={img("red-canyon.jpg")}
                alt="Red canyon"
                fill
                className="object-cover"
                quality={80}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Curated Routes ─── */

function RoutesOverview() {
  const routes = [
    {
      name: "50K Ultra",
      image: "trail-ridgeline.jpg",
      distance: "32.5 miles",
      elevation: "4,784 ft gain",
      type: "Backcountry",
    },
    {
      name: "Passage 5",
      image: "mountains-panorama.jpg",
      distance: "13.8 miles",
      elevation: "Moderate",
      type: "Arizona Trail",
    },
  ];
  return (
    <section id="routes" style={{ background: "var(--color-surface-low)" }} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-light italic mb-4 text-center"
          style={{ ...serif, color: "var(--color-secondary)" }}
        >
          Curated Routes
        </h2>
        <p
          className="text-center text-sm uppercase tracking-widest mb-16"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          Two ways to experience the Santa Rita Mountains
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {routes.map((r) => (
            <div key={r.name} className="group">
              <div className="relative aspect-video overflow-hidden mb-6">
                <Image
                  src={img(r.image)}
                  alt={r.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  quality={80}
                />
              </div>
              <h3
                className="text-2xl font-light italic mb-4"
                style={{ ...serif, color: "var(--color-primary)" }}
              >
                {r.name}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Distance", r.distance],
                  ["Elevation", r.elevation],
                  ["Type", r.type],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ ...body, color: "var(--color-outline)" }}
                    >
                      {label}
                    </div>
                    <div
                      className="text-sm"
                      style={{ ...body, color: "var(--color-on-surface)" }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. 50K Ultra Detail ─── */

function UltraDetail() {
  const highlights = [
    "Starts and finishes on the Arizona Trail at Apache Springs Ranch",
    "32.5 miles through the Coronado National Forest with 4,784 ft of climbing",
    "Mix of singletrack, forest roads (FR 4084, FR 4043, FR 4058), and Arizona Trail passages",
    "Sawmill Canyon and Greaterville Trail traverse through rugged backcountry",
    "Elevation range from 4,800 to 6,000 feet across the Santa Rita Mountains",
    "Multiple off-road waypoints \u2014 GPS device strongly recommended",
    "Aid stations at key junctions along the route",
    "Views of Mount Wrightson and the surrounding sky islands",
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          Route Detail
        </p>
        <h2
          className="text-3xl md:text-4xl font-light italic mb-6"
          style={{ ...serif, color: "var(--color-primary)" }}
        >
          The 50K Ultra
        </h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ ...body, color: "var(--color-on-surface-variant)" }}
        >
          A 32.5-mile odyssey through the Coronado National Forest. This is
          desert ultrarunning at its most raw — singletrack threading through
          canyons, forest roads climbing through oak woodland, and Arizona Trail
          passages with views that make you forget your legs.
        </p>
        <ul className="space-y-3">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-3 text-sm"
              style={{ ...body, color: "var(--color-on-surface-variant)" }}
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--color-primary)" }}
              />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── 6. Passage 5 Detail ─── */

function Passage5Detail() {
  const highlights = [
    "Kentucky Camp historic site (est. 1904) \u2014 a preserved mining camp along the route",
    "Diverse wildlife: black bears, bobcats, jaguars, and over 200 bird species",
    "Stunning views of Mount Wrightson (9,453 ft), the highest peak in the Santa Ritas",
    "Mix of singletrack, doubletrack, and dirt roads through grassland and oak savanna",
    "Potable water available at Kentucky Camp",
    "Well-marked Arizona Trail corridor with moderate elevation change",
  ];
  return (
    <section
      className="py-24 px-6"
      style={{ background: "var(--color-surface-low)" }}
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          Route Detail
        </p>
        <h2
          className="text-3xl md:text-4xl font-light italic mb-6"
          style={{ ...serif, color: "var(--color-primary)" }}
        >
          Passage 5: Santa Rita Mountains
        </h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ ...body, color: "var(--color-on-surface-variant)" }}
        >
          Arizona Trail Passage 5 is 13.8 miles of high-desert beauty through
          the heart of the Santa Rita Mountains. Less distance, no less
          extraordinary. This route passes through historic mining country,
          grassland valleys, and oak-studded ridgelines with panoramic views of
          the sky islands.
        </p>
        <ul className="space-y-3">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-3 text-sm"
              style={{ ...body, color: "var(--color-on-surface-variant)" }}
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--color-primary)" }}
              />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── 7. Schedule ─── */

function Schedule() {
  return (
    <section id="schedule" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-light italic mb-4 text-center"
          style={{ ...serif, color: "var(--color-secondary)" }}
        >
          The Schedule
        </h2>
        <p
          className="text-center text-sm uppercase tracking-widest mb-16"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          Three days in the Santa Ritas
        </p>
        <div className="space-y-16">
          {scheduleData.map((day) => (
            <div key={day.day} className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-3 md:sticky md:top-24 self-start">
                <div
                  className="text-2xl font-light italic"
                  style={{ ...serif, color: "var(--color-primary)" }}
                >
                  {day.day}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ ...body, color: "var(--color-outline)" }}
                >
                  {day.title}
                </div>
              </div>
              <div className="md:col-span-9 space-y-8">
                {day.events.map((ev) => (
                  <div
                    key={ev.time}
                    className="border-l-2 pl-6 py-2"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <div
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ ...body, color: "var(--color-outline)" }}
                    >
                      {ev.time}
                    </div>
                    <div
                      className="text-lg font-light italic mb-2"
                      style={{ ...serif, color: "var(--color-on-surface)" }}
                    >
                      {ev.name}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ ...body, color: "var(--color-on-surface-variant)" }}
                    >
                      {ev.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 8. What's Included ─── */

function Included() {
  return (
    <section
      className="py-24 px-6"
      style={{ background: "var(--color-surface-low)" }}
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-light italic mb-4 text-center"
          style={{ ...serif, color: "var(--color-secondary)" }}
        >
          What&apos;s Included
        </h2>
        <p
          className="text-center text-sm uppercase tracking-widest mb-16"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          Everything but the airfare
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {includedItems.map((item) => (
            <div
              key={item.title}
              className="p-6 text-center"
              style={{
                background: "var(--color-surface-container)",
                border: item.highlight
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--color-outline-variant)",
              }}
            >
              <span
                className="material-symbols-outlined text-3xl mb-3 block"
                style={{
                  color: item.highlight
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                }}
              >
                {item.icon}
              </span>
              <div
                className="text-sm font-medium mb-1"
                style={{ ...body, color: "var(--color-on-surface)" }}
              >
                {item.title}
              </div>
              <div
                className="text-xs"
                style={{ ...body, color: "var(--color-outline)" }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 9. Gallery ─── */

function Gallery() {
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-light italic mb-4 text-center"
          style={{ ...serif, color: "var(--color-secondary)" }}
        >
          The Visual Narrative
        </h2>
        <p
          className="text-center text-sm leading-relaxed max-w-xl mx-auto mb-16"
          style={{ ...body, color: "var(--color-on-surface-variant)" }}
        >
          The stillness of Apache Springs offers unique wildlife encounters —
          longhorns grazing at dawn, horses running through open pasture, and
          the kind of night sky you forgot existed.
        </p>
        <div
          className="gap-4"
          style={{ columns: "3 280px" }}
        >
          {galleryImages.map((g) => (
            <div key={g.src} className="mb-4 break-inside-avoid">
              <Image
                src={img(g.src)}
                alt={g.alt}
                width={600}
                height={400}
                className="w-full h-auto"
                quality={75}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 10. FAQ ─── */

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="py-24 px-6"
      style={{ background: "var(--color-surface-low)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-light italic mb-4 text-center"
          style={{ ...serif, color: "var(--color-secondary)" }}
        >
          Frequently Asked
        </h2>
        <p
          className="text-center text-sm uppercase tracking-widest mb-16"
          style={{ ...body, color: "var(--color-outline)" }}
        >
          What you need to know
        </p>
        <div className="space-y-10">
          {faqData.map((cat) => (
            <div key={cat.category}>
              <h3
                className="text-xs uppercase tracking-widest mb-4"
                style={{ ...body, color: "var(--color-primary)" }}
              >
                {cat.category}
              </h3>
              <div className="space-y-0">
                {cat.items.map((item) => {
                  const key = `${cat.category}-${item.q}`;
                  const isOpen = openIdx === key;
                  return (
                    <div
                      key={key}
                      className="border-b"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    >
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : key)}
                        className="w-full flex justify-between items-center py-5 text-left"
                        style={{ ...body, color: "var(--color-on-surface)" }}
                      >
                        <span className="text-sm pr-4">{item.q}</span>
                        <span
                          className="text-lg flex-shrink-0 transition-transform duration-300"
                          style={{
                            color: "var(--color-outline)",
                            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                          }}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          className="pb-5 text-sm leading-relaxed"
                          style={{ ...body, color: "var(--color-on-surface-variant)" }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 11. Register Interest ─── */

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    runPreference: "undecided",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/apache-springs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", runPreference: "undecided", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    ...body,
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-outline-variant)",
    color: "var(--color-on-surface)",
    outline: "none",
    padding: "12px 0",
    width: "100%",
    fontSize: "14px",
  };

  const runOptions = ["50K Ultra", "13.8-Mile", "Undecided"];

  return (
    <section id="register" className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <h2
            className="text-3xl md:text-4xl font-light italic mb-4"
            style={{ ...serif, color: "var(--color-secondary)" }}
          >
            Secure Your Place
            <br />
            in the Dust.
          </h2>
          <p
            className="text-sm leading-relaxed mb-10"
            style={{ ...body, color: "var(--color-on-surface-variant)" }}
          >
            Apache Springs is an intimate gathering of 20 runners. Submit your
            expression of interest and we&apos;ll be in touch to discuss your
            place.
          </p>

          {status === "success" ? (
            <div
              className="p-8 text-center"
              style={{
                background: "var(--color-surface-container)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <p
                className="text-lg font-light italic mb-2"
                style={{ ...serif, color: "var(--color-primary)" }}
              >
                Expression Received
              </p>
              <p
                className="text-sm"
                style={{ ...body, color: "var(--color-on-surface-variant)" }}
              >
                We&apos;ll be in touch soon. Watch your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Name *"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                style={inputStyle}
              />
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ ...body, color: "var(--color-outline)" }}
                >
                  Run Preference
                </p>
                <div className="flex gap-3">
                  {runOptions.map((opt) => {
                    const val = opt.toLowerCase().replace(/[^a-z0-9]/g, "-");
                    const isActive = formData.runPreference === val;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, runPreference: val }))
                        }
                        className="px-4 py-2 text-xs uppercase tracking-widest transition-all"
                        style={{
                          ...body,
                          background: isActive
                            ? "var(--color-primary)"
                            : "transparent",
                          color: isActive
                            ? "var(--color-on-primary)"
                            : "var(--color-on-surface-variant)",
                          border: `1px solid ${
                            isActive
                              ? "var(--color-primary)"
                              : "var(--color-outline-variant)"
                          }`,
                          borderRadius: "999px",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <textarea
                placeholder="Tell us about yourself and your running background..."
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, message: e.target.value }))
                }
                style={{ ...inputStyle, resize: "none" as const }}
              />
              {status === "error" && (
                <p className="text-sm" style={{ color: "#ff6b6b" }}>
                  Something went wrong. Please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-4 text-sm uppercase tracking-widest font-semibold transition-all hover:brightness-110 flex items-center justify-center gap-2"
                style={{
                  ...body,
                  background: "linear-gradient(135deg, #ffb688, #ce7c44)",
                  color: "#512400",
                  borderRadius: "2px",
                  opacity: status === "sending" ? 0.7 : 1,
                }}
              >
                {status === "sending" ? "Sending..." : "Send Expression of Interest"}
                {status !== "sending" && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
        <div className="relative hidden md:block">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={img("trail-ridgeline.jpg")}
              alt="Trail ridgeline"
              fill
              className="object-cover"
              quality={80}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-8"
              style={{
                background: "rgba(22, 19, 16, 0.7)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <p
                className="text-lg font-light italic mb-1"
                style={{ ...serif, color: "var(--color-primary)" }}
              >
                April 2026
              </p>
              <p
                className="text-xs uppercase tracking-widest"
                style={{ ...body, color: "var(--color-outline)" }}
              >
                Santa Rita Mountains, AZ
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 12. Editorial Quote ─── */

function EditorialQuote() {
  return (
    <section
      className="py-24 px-6"
      style={{ background: "var(--color-surface-low)" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <blockquote
          className="text-2xl md:text-3xl font-light italic leading-relaxed"
          style={{ ...serif, color: "var(--color-on-surface)" }}
        >
          &ldquo;The desert strips away everything that doesn&apos;t matter.
          What&apos;s left is the run, the land, and the people beside
          you.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}

/* ─── 13. Footer ─── */

function Footer() {
  return (
    <footer className="py-16 px-6 bg-stone-950">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <h3
            className="text-xl font-light italic mb-3"
            style={{ ...serif, color: "var(--color-primary)" }}
          >
            Apache Springs
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ ...body, color: "var(--color-on-surface-variant)" }}
          >
            An ultramarathon and retreat in the Santa Rita Mountains.
          </p>
          <a
            href="https://apachespringsranch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-orange-400 transition-colors"
            style={{ ...body, color: "var(--color-outline)" }}
          >
            apachespringsranch.com &rarr;
          </a>
        </div>
        <div>
          <h4
            className="text-xs uppercase tracking-widest mb-4"
            style={{ ...body, color: "var(--color-outline)" }}
          >
            The Expedition
          </h4>
          <nav className="space-y-2">
            {[
              ["The Ranch", "#ranch"],
              ["Routes", "#routes"],
              ["Schedule", "#schedule"],
              ["Gallery", "#gallery"],
              ["FAQ", "#faq"],
              ["Register", "#register"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="block text-sm hover:text-orange-400 transition-colors"
                style={{ ...body, color: "var(--color-on-surface-variant)" }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <h4
            className="text-xs uppercase tracking-widest mb-4"
            style={{ ...body, color: "var(--color-outline)" }}
          >
            Connect
          </h4>
          <a
            href="#register"
            className="inline-block px-6 py-3 text-sm uppercase tracking-widest font-semibold transition-all hover:brightness-110"
            style={{
              ...body,
              background: "linear-gradient(135deg, #ffb688, #ce7c44)",
              color: "#512400",
              borderRadius: "2px",
            }}
          >
            Register Interest
          </a>
        </div>
      </div>
      <div
        className="max-w-6xl mx-auto mt-12 pt-8 text-center text-xs"
        style={{
          ...body,
          borderTop: "1px solid var(--color-outline-variant)",
          color: "var(--color-outline)",
        }}
      >
        &copy; {new Date().getFullYear()} Apache Springs. A Go Run Rabbit Experience.
      </div>
    </footer>
  );
}

/* ─── Main Export ─── */

export default function ApacheSpringsContent() {
  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      <Nav />
      <Hero />
      <StatsBar />
      <RanchIntro />
      <RoutesOverview />
      <UltraDetail />
      <Passage5Detail />
      <Schedule />
      <Included />
      <Gallery />
      <FaqSection />
      <Register />
      <EditorialQuote />
      <Footer />
    </main>
  );
}
