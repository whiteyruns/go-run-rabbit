"use client";

import Image from "next/image";
import { useState } from "react";

const FAQ_DATA = [
  {
    category: "Getting There",
    items: [
      {
        q: "Where is Apache Springs Ranch?",
        a: "The ranch is located in the Santa Rita Mountains, roughly one hour south of Tucson, Arizona. You'll be surrounded by Coronado National Forest at the edge of the Mount Wrightson range.",
      },
      {
        q: "Which airport should I fly into?",
        a: "Tucson International Airport (TUS) is about one hour from the ranch. Phoenix Sky Harbor (PHX) is approximately 2.5 hours away. We recommend TUS for the simplest logistics.",
      },
      {
        q: "Is there a shuttle service?",
        a: "Yes. We coordinate a group shuttle from Tucson on arrival day and back to Tucson on departure day. Details and timing are sent after your spot is confirmed.",
      },
    ],
  },
  {
    category: "The Ranch",
    items: [
      {
        q: "What is the property like?",
        a: "Apache Springs Ranch sits on 160 acres in the Santa Rita Mountains. The property features shared rooms with modern amenities, communal gathering spaces, a cold plunge, and horses and longhorns on site.",
      },
      {
        q: "Is there cell service or Wi-Fi?",
        a: "Cell service is limited. There is Wi-Fi available in the main lodge, but coverage is minimal elsewhere on the property. Consider it a feature, not a bug.",
      },
    ],
  },
  {
    category: "The Runs",
    items: [
      {
        q: "What are the two routes?",
        a: "The 50K is a 32.5-mile backcountry route through Coronado National Forest with 4,784 feet of elevation gain. Half-Marathon follows 13.8 miles of the Arizona Trail at moderate elevation — challenging but accessible for experienced trail runners.",
      },
      {
        q: "Are there aid stations?",
        a: "Yes. Aid stations are stocked at key junctions along both routes with water, electrolytes, nutrition, and basic first aid.",
      },
    ],
  },
  {
    category: "The Gear",
    items: [
      {
        q: "What gear do I need?",
        a: "Trail running shoes are essential. Carry at least 2L of hydration and a headlamp. For the 50K, a GPS watch or handheld GPS device is strongly recommended. A full gear list is provided after registration.",
      },
    ],
  },
  {
    category: "What's Included",
    items: [
      {
        q: "What does my spot cover?",
        a: "Everything except airfare and personal gear. That includes three nights of lodging, all meals, full course support and timing, aid stations, recovery sessions, cold plunge, equine therapy, fireside dinners, and a finisher kit.",
      },
    ],
  },
  {
    category: "Exclusivity",
    items: [
      {
        q: "How do I get an invite?",
        a: "Apache Springs Retreat is invite-only, limited to 20 runners per event. Priority is given to returning runners and referrals from the community. Submit an expression of interest and we'll be in touch.",
      },
    ],
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    runPreference: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    try {
      const res = await fetch("/api/apache-springs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormStatus("success");
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <main className="relative">
      {/* ===== Hero Section ===== */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/apache-springs/mountains-panorama.jpg"
            alt="Striking wide-angle shot of the Santa Rita Mountains at dawn with high contrast shadows and orange glow on the horizon"
            fill
            className="object-cover grayscale brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter mb-4 text-ce-on-surface">
            Apache Springs Retreat
          </h1>
          <p className="font-label text-sm md:text-lg tracking-widest text-ce-primary mb-12 max-w-3xl mx-auto">
            AN INVITE-ONLY ULTRAMARATHON AND RETREAT IN THE SANTA RITA MOUNTAINS
            OF SOUTHERN ARIZONA. THREE DAYS. TWENTY RUNNERS. ONE HUNDRED SIXTY
            ACRES.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="#register"
              className="bg-ce-primary-container text-ce-on-primary-fixed px-10 py-4 font-label text-sm uppercase tracking-widest border-none hover:brightness-110 transition-all"
            >
              Secure Spot
            </a>
            <button className="border border-ce-on-surface text-ce-on-surface px-10 py-4 font-label text-sm uppercase tracking-widest hover:bg-ce-on-surface hover:text-ce-surface transition-all">
              The Routes
            </button>
          </div>
        </div>
        {/* Technical Overlay Decoration */}
        <div className="absolute bottom-10 left-10 hidden md:block border-l border-t border-ce-outline-variant p-4 opacity-50">
          <p className="font-label text-[10px] text-ce-secondary">
            HUD // SANTA_RITAS
          </p>
          <p className="font-label text-[10px] text-ce-on-surface-variant">
            SECTOR: CORONADO_NTL_FOREST
          </p>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="bg-ce-surface-lowest py-8 border-y border-ce-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-label text-ce-secondary uppercase tracking-tighter">
              Lat/Long
            </span>
            <span className="font-label text-sm">31.6703° N, 110.7410° W</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-label text-ce-secondary uppercase tracking-tighter">
              Area Coverage
            </span>
            <span className="font-label text-sm">
              160 ACRES // SANTA RITA MOUNTAINS
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-label text-ce-secondary uppercase tracking-tighter">
              Max Elevation
            </span>
            <span className="font-label text-sm">
              6,000 FT // MOUNT WRIGHTSON RANGE
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-label text-ce-secondary uppercase tracking-tighter">
              Status
            </span>
            <span className="font-label text-sm">
              OPERATIONAL // 20 RUNNERS MAX
            </span>
          </div>
        </div>
      </section>

      {/* ===== Two Column — The Technical Frontier ===== */}
      <section className="py-24 px-6 max-w-7xl mx-auto topo-bg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-5 sticky top-32">
            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase mb-8 leading-tight">
              The Technical <br />
              <span className="text-ce-primary-container">Frontier</span>: A
              retreat for the bold.
            </h2>
            <p className="text-lg text-ce-on-surface-variant mb-8 font-body leading-relaxed">
              Apache Springs Ranch is not a race. It is a retreat for runners who
              want more than a finish line. Set on 160 acres in Arizona&rsquo;s
              Santa Rita Mountains &mdash; trail running by day, fireside
              conversation by night. Twenty runners. Two curated routes. Three
              days of running, recovery, and connection.
            </p>
            <div className="border-l-4 border-ce-primary-container pl-6 py-2">
              <p className="font-label text-xs text-ce-secondary uppercase tracking-[0.2em] mb-2">
                Protocol 01
              </p>
              <p className="italic font-headline text-xl">
                &ldquo;The desert strips away everything that doesn&rsquo;t
                matter. What&rsquo;s left is the run, the land, and the people
                beside you.&rdquo;
              </p>
            </div>
          </div>
          <div className="md:col-span-7 flex flex-col gap-12">
            <div className="relative group overflow-hidden">
              <Image
                src="/images/apache-springs/trail-ridgeline.jpg"
                alt="Trail runner navigating a rocky ridgeline in the Santa Rita Mountains with dust and golden light"
                width={1200}
                height={500}
                className="w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700 brightness-75"
              />
              <div className="absolute top-4 right-4 bg-ce-surface/80 backdrop-blur px-3 py-1 font-label text-[10px] border border-ce-outline-variant/30">
                CAM_01 // RIDGELINE_TRAIL
              </div>
            </div>
            <div className="relative group overflow-hidden md:ml-20">
              <Image
                src="/images/apache-springs/red-canyon.jpg"
                alt="Desert flora and rugged terrain in the Santa Rita Mountains under harsh sunlight"
                width={1200}
                height={400}
                className="w-full h-[400px] object-cover grayscale hover:grayscale-0 transition-all duration-700 brightness-75"
              />
              <div className="absolute bottom-4 left-4 bg-ce-surface/80 backdrop-blur px-3 py-1 font-label text-[10px] border border-ce-outline-variant/30">
                BIO_04 // SANTA_RITAS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Route Cards ===== */}
      <section className="bg-ce-surface-low py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <p className="font-label text-xs text-ce-primary uppercase tracking-[0.3em] mb-2">
                Navigation
              </p>
              <h2 className="text-4xl font-headline font-black uppercase">
                Technical Routes
              </h2>
            </div>
            <span className="font-label text-[10px] text-ce-on-surface-variant opacity-40 hidden md:block">
              VIEW_ALL_PROTOCOLS
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ce-outline-variant/20">
            {/* Card 1 */}
            <div className="bg-ce-surface p-8 md:p-12 hover:bg-ce-surface-bright transition-colors group">
              <div className="flex justify-between mb-12">
                <span className="font-label text-xs text-[#ffddae]">
                  01 // CORONADO_FOREST
                </span>
                <span className="material-symbols-outlined text-ce-primary-container">
                  near_me
                </span>
              </div>
              <h3 className="text-3xl font-headline font-bold uppercase mb-4">
                The 50K
              </h3>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Distance
                  </p>
                  <p className="font-label text-lg">32.5 MILES</p>
                </div>
                <div>
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Vertical Gain
                  </p>
                  <p className="font-label text-lg">+4,784 FT</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Terrain Complexity
                  </p>
                  <p className="font-label text-lg text-ce-primary">
                    V_LEVEL: BACKCOUNTRY
                  </p>
                </div>
              </div>
              <button className="w-full py-4 border border-ce-outline-variant font-label text-xs uppercase tracking-widest group-hover:border-ce-primary-container group-hover:bg-ce-primary-container group-hover:text-ce-on-primary-fixed transition-all">
                Review Intel
              </button>
            </div>
            {/* Card 2 */}
            <div className="bg-ce-surface p-8 md:p-12 hover:bg-ce-surface-bright transition-colors group">
              <div className="flex justify-between mb-12">
                <span className="font-label text-xs text-[#ffddae]">
                  02 // AZ_TRAIL_SECTOR
                </span>
                <span className="material-symbols-outlined text-ce-primary-container">
                  settings_input_antenna
                </span>
              </div>
              <h3 className="text-3xl font-headline font-bold uppercase mb-4">
                Half-Marathon
              </h3>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Distance
                  </p>
                  <p className="font-label text-lg">13.8 MILES</p>
                </div>
                <div>
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Vertical Gain
                  </p>
                  <p className="font-label text-lg">MODERATE GAIN</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-label text-ce-on-surface-variant uppercase mb-1">
                    Terrain Complexity
                  </p>
                  <p className="font-label text-lg text-ce-secondary">
                    V_LEVEL: ARIZONA_TRAIL
                  </p>
                </div>
              </div>
              <button className="w-full py-4 border border-ce-outline-variant font-label text-xs uppercase tracking-widest group-hover:border-ce-primary-container group-hover:bg-ce-primary-container group-hover:text-ce-on-primary-fixed transition-all">
                Review Intel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Schedule ===== */}
      <section className="py-24 px-6 bg-ce-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 border border-ce-outline-variant/30">
            <div className="p-10 border-b md:border-b-0 md:border-r border-ce-outline-variant/30 hover:bg-ce-surface-highest transition-colors">
              <p className="font-label text-ce-primary-container text-2xl mb-6">
                01
              </p>
              <h4 className="font-headline text-2xl uppercase font-bold mb-4">
                Arrival
              </h4>
              <p className="text-sm text-ce-on-surface-variant font-body">
                Arrive at the ranch. Settle in. Course briefing with maps and
                elevation profiles. Communal supper under the Arizona sky.
              </p>
            </div>
            <div className="p-10 border-b md:border-b-0 md:border-r border-ce-outline-variant/30 hover:bg-ce-surface-highest transition-colors">
              <p className="font-label text-ce-primary-container text-2xl mb-6">
                02
              </p>
              <h4 className="font-headline text-2xl uppercase font-bold mb-4">
                Run Day
              </h4>
              <p className="text-sm text-ce-on-surface-variant font-body">
                Pre-dawn fuel at 05:00. Both routes depart the ranch gate at
                06:30. Recovery sessions, cold plunge. Victory fireside dinner
                under the Milky Way.
              </p>
            </div>
            <div className="p-10 hover:bg-ce-surface-highest transition-colors">
              <p className="font-label text-ce-primary-container text-2xl mb-6">
                03
              </p>
              <h4 className="font-headline text-2xl uppercase font-bold mb-4">
                Departure
              </h4>
              <p className="text-sm text-ce-on-surface-variant font-body">
                Guided equine therapy session. Brunch, farewells, shuttle to
                Tucson.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== What's Included ===== */}
      <section className="py-24 px-6 bg-ce-surface-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-label text-xs text-ce-primary uppercase tracking-[0.3em] mb-2">
              Your Spot Covers
            </p>
            <h2 className="text-4xl font-headline font-black uppercase">
              What&rsquo;s Included
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ce-outline-variant/20">
            {[
              {
                icon: "home_pin",
                title: "Lodging",
                desc: "Three nights at the ranch",
              },
              {
                icon: "restaurant",
                title: "All Meals",
                desc: "Chef-prepared, communal dining",
              },
              {
                icon: "confirmation_number",
                title: "Run Entry",
                desc: "Full course support and timing",
              },
              {
                icon: "medical_services",
                title: "Aid Stations",
                desc: "Stocked at key junctions",
              },
              {
                icon: "self_improvement",
                title: "Recovery",
                desc: "Post-run sessions and cold plunge",
              },
              {
                icon: "cruelty_free",
                title: "Equine Therapy",
                desc: "Guided session with ranch horses",
              },
              {
                icon: "fireplace",
                title: "Fireside Dinners",
                desc: "Under the Arizona sky",
              },
              {
                icon: "stars",
                title: "The Finisher Kit",
                desc: "Custom gear for every finisher",
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`bg-ce-surface-low p-8 hover:bg-ce-surface-bright transition-colors ${
                  item.highlight
                    ? "border-l-4 border-ce-primary-container"
                    : ""
                }`}
              >
                <span className="material-symbols-outlined text-ce-primary-container text-3xl mb-4 block">
                  {item.icon}
                </span>
                <h4 className="font-label text-sm uppercase tracking-wider mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-ce-on-surface-variant font-body">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 px-6 bg-ce-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-label text-xs text-ce-primary uppercase tracking-[0.3em] mb-2">
              Intel
            </p>
            <h2 className="text-4xl font-headline font-black uppercase">
              Frequently Asked
            </h2>
          </div>
          <div className="max-w-3xl">
            {FAQ_DATA.map((section) => (
              <div key={section.category} className="mb-8">
                <p className="font-label text-xs text-ce-secondary uppercase tracking-[0.2em] mb-4">
                  {section.category}
                </p>
                {section.items.map((item) => {
                  const key = `${section.category}-${item.q}`;
                  const isOpen = openFaq === key;
                  return (
                    <div
                      key={key}
                      className="border-b border-ce-outline-variant/20"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        className="w-full flex justify-between items-center py-5 text-left hover:bg-ce-surface-highest transition-colors px-4"
                      >
                        <span className="font-body text-sm text-ce-on-surface pr-4">
                          {item.q}
                        </span>
                        <span className="font-label text-ce-primary-container text-lg shrink-0">
                          {isOpen ? "\u2212" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-5">
                          <p className="text-sm text-ce-on-surface-variant font-body leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Registration Form ===== */}
      <section id="register" className="py-24 px-6 bg-ce-surface-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ce-outline-variant/20">
            {/* Form Column */}
            <div className="bg-ce-surface-low p-8 md:p-16">
              <p className="font-label text-xs text-ce-primary uppercase tracking-[0.3em] mb-2">
                Expression of Interest
              </p>
              <h2 className="text-3xl md:text-4xl font-headline font-black uppercase mb-12">
                Secure Your Spot
              </h2>

              {formStatus === "success" ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-ce-primary-container text-5xl mb-6 block">
                    check_circle
                  </span>
                  <p className="font-headline text-2xl uppercase font-bold mb-2">
                    Expression Received
                  </p>
                  <p className="font-label text-sm text-ce-on-surface-variant uppercase tracking-wider">
                    We&rsquo;ll be in touch soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="font-label text-[10px] text-ce-secondary uppercase tracking-[0.2em] block mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-ce-surface-highest border-0 border-b border-ce-outline-variant/30 px-4 py-3 font-body text-sm text-ce-on-surface focus:outline-none focus:border-ce-primary-container transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-ce-secondary uppercase tracking-[0.2em] block mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-ce-surface-highest border-0 border-b border-ce-outline-variant/30 px-4 py-3 font-body text-sm text-ce-on-surface focus:outline-none focus:border-ce-primary-container transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-ce-secondary uppercase tracking-[0.2em] block mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-ce-surface-highest border-0 border-b border-ce-outline-variant/30 px-4 py-3 font-body text-sm text-ce-on-surface focus:outline-none focus:border-ce-primary-container transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-ce-secondary uppercase tracking-[0.2em] block mb-3">
                      Run Preference
                    </label>
                    <div className="flex gap-2">
                      {["50K", "Half-Marathon", "Undecided"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, runPreference: option })
                          }
                          className={`px-5 py-3 font-label text-xs uppercase tracking-wider border transition-all ${
                            formData.runPreference === option
                              ? "bg-ce-primary-container text-ce-on-primary-fixed border-ce-primary-container"
                              : "border-ce-outline-variant/30 text-ce-on-surface-variant hover:border-ce-primary-container"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-ce-secondary uppercase tracking-[0.2em] block mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-ce-surface-highest border-0 border-b border-ce-outline-variant/30 px-4 py-3 font-body text-sm text-ce-on-surface focus:outline-none focus:border-ce-primary-container transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full bg-ce-primary-container text-ce-on-primary-fixed py-4 font-label text-sm uppercase tracking-widest font-bold hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {formStatus === "submitting"
                      ? "Transmitting..."
                      : "Submit Expression"}
                  </button>
                  {formStatus === "error" && (
                    <p className="font-label text-xs text-red-400 uppercase tracking-wider text-center">
                      Transmission failed. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>
            {/* Image Column */}
            <div className="relative hidden md:block overflow-hidden">
              <Image
                src="/images/apache-springs/sunset-mountains.jpg"
                alt="Santa Rita Mountains at golden hour with deep canyon shadows"
                fill
                className="object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-8 left-8 bg-ce-surface/80 backdrop-blur px-4 py-2 font-label text-[10px] border border-ce-outline-variant/30">
                CAM_03 // RANCH_GATE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Full Bleed Quote Banner ===== */}
      <section className="relative h-[614px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/apache-springs/sunset-mountains.jpg"
            alt="Wide cinematic landscape of the Santa Rita Mountains at dusk with deep shadows and subtle purple and orange sky"
            fill
            className="object-cover grayscale brightness-[0.3]"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="font-headline italic text-2xl md:text-5xl text-ce-on-surface max-w-4xl mx-auto leading-tight">
            &ldquo;The desert strips away everything that doesn&rsquo;t matter.
            What&rsquo;s left is the run, the land, and the people beside
            you.&rdquo;
          </p>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="py-32 px-6 bg-ce-surface-lowest text-center relative overflow-hidden">
        <div className="absolute inset-0 topo-bg opacity-10" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-7xl font-headline font-black uppercase mb-12 tracking-tight">
            Run the Desert. <br />
            Join the Expedition.
          </h2>
          <a
            href="#register"
            className="inline-block bg-ce-primary-container text-ce-on-primary-fixed px-16 py-6 font-label text-sm uppercase tracking-widest font-bold border-none hover:scale-105 transition-transform active:scale-95 shadow-2xl"
          >
            Secure Spot Now
          </a>
          <div className="mt-16 flex justify-center gap-12 text-[10px] font-label text-ce-on-surface-variant uppercase tracking-widest">
            <span>Limited to 20 Runners</span>
            <span>April 2026 // Santa Rita Mountains</span>
          </div>
        </div>
      </section>
    </main>
  );
}
