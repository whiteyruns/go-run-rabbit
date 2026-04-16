"use client";

import Image from "next/image";

export default function RoutesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[614px] flex items-end overflow-hidden">
        <Image
          src="/images/apache-springs/red-canyon.jpg"
          alt="dramatic low angle shot of a narrow desert canyon with jagged orange sandstone walls and a thin sliver of sky above"
          fill
          className="object-cover grayscale brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ce-surface via-transparent to-transparent" />
        <div className="relative z-10 p-8 md:p-16 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold uppercase tracking-widest leading-none mb-4">
            The Routes
          </h1>
          <p className="font-label text-ce-primary-container text-sm md:text-lg uppercase tracking-[0.3em]">
            Two curated routes through the Coronado National Forest and Arizona Trail.
          </p>
        </div>
        <div className="absolute right-8 bottom-8 font-label text-[10px] text-ce-outline-variant opacity-50 text-right uppercase">
          LAT: 31.6703&deg; N<br />
          LONG: 110.7410&deg; W
        </div>
      </section>

      {/* Route Overview Bento */}
      <section className="px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-1 topo-bg">
        {/* Card 1 */}
        <div className="bg-ce-surface-low p-8 border-l-4 border-ce-primary-container">
          <div className="flex justify-between items-start mb-8">
            <span className="font-label text-xs text-ce-secondary bg-ce-surface-highest px-3 py-1">
              ROUTE ID // AS-50K
            </span>
            <span className="material-symbols-outlined text-ce-primary-container">route</span>
          </div>
          <h2 className="text-4xl font-headline font-bold uppercase mb-4">The 50K</h2>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-label text-[10px] text-ce-outline uppercase mb-1">Total Distance</p>
              <p className="font-label text-2xl font-bold">32.5 MI</p>
              <p className="font-label text-[10px] text-ce-outline">(52.3 KM)</p>
            </div>
            <div>
              <p className="font-label text-[10px] text-ce-outline uppercase mb-1">Vertical Gain</p>
              <p className="font-label text-2xl font-bold text-ce-primary-container">+4,784 FT</p>
            </div>
          </div>
          <p className="text-ce-on-surface-variant font-body mb-6 leading-relaxed">
            Through the Coronado National Forest via forest roads FR 4084, 4043, and 4058. Sustained
            backcountry ridgeline with views of Mount Wrightson. GPS strongly recommended.
          </p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-ce-primary-container" />
            <span className="font-label text-xs uppercase tracking-widest">Status: Operational</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-ce-surface-container p-8 border-l-4 border-ce-secondary">
          <div className="flex justify-between items-start mb-8">
            <span className="font-label text-xs text-ce-primary-container bg-ce-surface-lowest px-3 py-1">
              ROUTE ID // AS-P5
            </span>
            <span className="material-symbols-outlined text-ce-secondary">mountain_flag</span>
          </div>
          <h2 className="text-4xl font-headline font-bold uppercase mb-4">Half-Marathon</h2>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-label text-[10px] text-ce-outline uppercase mb-1">Total Distance</p>
              <p className="font-label text-2xl font-bold">13.8 MI</p>
              <p className="font-label text-[10px] text-ce-outline">(22.2 KM)</p>
            </div>
            <div>
              <p className="font-label text-[10px] text-ce-outline uppercase mb-1">Vertical Gain</p>
              <p className="font-label text-2xl font-bold text-ce-secondary">MODERATE</p>
            </div>
          </div>
          <p className="text-ce-on-surface-variant font-body mb-6 leading-relaxed">
            Along the Arizona Trail through the Santa Rita Mountains. Passes Kentucky Camp, a preserved
            1904 gold mining operation. Both routes start and finish at the ranch gate.
          </p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-ce-secondary" />
            <span className="font-label text-xs uppercase tracking-widest">
              Status: Operational
            </span>
          </div>
        </div>
      </section>

      {/* Elevation Profile: 50K */}
      <section className="bg-ce-surface-lowest py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h3 className="font-label text-ce-primary-container text-xs uppercase tracking-[0.5em] mb-4">
              Technical Specification
            </h3>
            <h2 className="text-5xl font-headline font-black uppercase mb-12">
              Elevation Profile: 50K
            </h2>

            {/* SVG Elevation Profile */}
            <div className="w-full h-48 bg-ce-surface-container flex items-end relative border-b border-ce-outline-variant/30 overflow-hidden">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1000 200"
              >
                <path
                  d="M0 200 L0 180 L50 160 L100 190 L150 150 L200 130 L250 140 L300 80 L350 40 L400 90 L450 110 L500 50 L550 20 L600 60 L650 100 L700 150 L750 130 L800 110 L850 170 L900 190 L950 185 L1000 200 Z"
                  fill="rgba(247, 96, 12, 0.2)"
                  stroke="#f7600c"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none">
                <div className="border-l border-ce-primary-container/20 h-full w-px" />
                <div className="border-l border-ce-primary-container/20 h-full w-px" />
                <div className="border-l border-ce-primary-container/20 h-full w-px" />
                <div className="border-l border-ce-primary-container/20 h-full w-px" />
              </div>
            </div>
            <div className="flex justify-between mt-4 font-label text-[10px] text-ce-outline uppercase">
              <span>START // 0 MI</span>
              <span>AID_1 // 8 MI</span>
              <span>SUMMIT // 16 MI</span>
              <span>AID_2 // 24 MI</span>
              <span>FINISH // 32.5 MI</span>
            </div>
          </div>

          {/* Cue Sheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ce-surface-highest">
                  <th className="p-4 text-left font-label text-xs uppercase text-ce-primary">
                    Distance
                  </th>
                  <th className="p-4 text-left font-label text-xs uppercase text-ce-primary">
                    Elevation
                  </th>
                  <th className="p-4 text-left font-label text-xs uppercase text-ce-primary">
                    Action / Landmark
                  </th>
                  <th className="p-4 text-left font-label text-xs uppercase text-ce-primary">
                    Terrain Type
                  </th>
                </tr>
              </thead>
              <tbody className="font-label text-[11px] uppercase">
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">0.0 mi</td>
                  <td className="p-4">4,800 ft</td>
                  <td className="p-4">Departure: Ranch Gate</td>
                  <td className="p-4 text-ce-secondary">Gravel Road</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">3.2 mi</td>
                  <td className="p-4">4,950 ft</td>
                  <td className="p-4">FR 4084 Junction</td>
                  <td className="p-4 text-ce-secondary">Forest Road</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">6.5 mi</td>
                  <td className="p-4">5,200 ft</td>
                  <td className="p-4">Sawmill Canyon Entrance</td>
                  <td className="p-4 text-ce-secondary">Single Track</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">9.8 mi</td>
                  <td className="p-4">5,500 ft</td>
                  <td className="p-4">Aid Station 1 // Water + Electrolytes</td>
                  <td className="p-4 text-ce-secondary">Forest Road</td>
                </tr>
                {/* Critical Sector Highlight */}
                <tr className="border-b border-ce-outline-variant/20 bg-ce-primary-container/10">
                  <td
                    className="p-2 text-center text-ce-primary-container tracking-[0.3em] font-bold"
                    colSpan={4}
                  >
                    CRITICAL SECTOR: GREATERVILLE TRAIL ASCENT
                  </td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">13.1 mi</td>
                  <td className="p-4">5,800 ft</td>
                  <td className="p-4">Greaterville Trail Junction</td>
                  <td className="p-4 text-ce-secondary">Technical Trail</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">16.4 mi</td>
                  <td className="p-4">6,000 ft</td>
                  <td className="p-4">Mount Wrightson Viewpoint (Peak Elevation)</td>
                  <td className="p-4 text-ce-secondary">Ridgeline</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">19.7 mi</td>
                  <td className="p-4">5,700 ft</td>
                  <td className="p-4">FR 4043 Connector</td>
                  <td className="p-4 text-ce-secondary">Forest Road</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">23.0 mi</td>
                  <td className="p-4">5,400 ft</td>
                  <td className="p-4">Aid Station 2 // Water + Food</td>
                  <td className="p-4 text-ce-secondary">Forest Road</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">26.3 mi</td>
                  <td className="p-4">5,100 ft</td>
                  <td className="p-4">FR 4058 Descent</td>
                  <td className="p-4 text-ce-secondary">Gravel Road</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">29.6 mi</td>
                  <td className="p-4">4,900 ft</td>
                  <td className="p-4">Final Canyon Traverse</td>
                  <td className="p-4 text-ce-secondary">Canyon Trail</td>
                </tr>
                <tr className="border-b border-ce-outline-variant/20 hover:bg-ce-surface-bright transition-colors">
                  <td className="p-4">32.5 mi</td>
                  <td className="p-4">4,800 ft</td>
                  <td className="p-4">Finish: Ranch Gate</td>
                  <td className="p-4 text-ce-secondary">Gravel Road</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Half-Marathon: Arizona Trail */}
      <section className="grid grid-cols-1 md:grid-cols-2 bg-ce-surface">
        <div className="h-[600px] relative overflow-hidden">
          <Image
            src="/images/apache-springs/barn-arena.jpg"
            alt="high contrast black and white photo of a weathered historical wooden cabin in a vast desert landscape under a clear sky"
            fill
            className="object-cover grayscale brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-ce-primary-container mix-blend-overlay opacity-20" />
          <div className="absolute top-8 left-8 bg-ce-surface-container px-4 py-2 font-label text-xs uppercase tracking-widest text-ce-primary-container">
            Half-Marathon // Kentucky Camp
          </div>
        </div>
        <div className="p-12 md:p-24 flex flex-col justify-center">
          <h2 className="text-4xl font-headline font-bold uppercase mb-8">
            Half-Marathon: Arizona Trail
          </h2>
          <p className="text-ce-on-surface-variant font-body mb-8 leading-relaxed">
            Kentucky Camp is a preserved 1904 gold mining camp along the Arizona Trail. Originally the
            headquarters of the Santa Rita Water &amp; Mining Company. Permanent water source and natural
            shelter. Listed on the National Register of Historic Places.
          </p>
          <ul className="space-y-6">
            <li className="flex items-start">
              <span className="material-symbols-outlined text-ce-primary-container mr-4">
                visibility
              </span>
              <div>
                <p className="font-label text-xs uppercase font-bold text-ce-on-surface">
                  Mount Wrightson Views
                </p>
                <p className="text-[11px] text-ce-outline">
                  Clear sightlines to Mount Wrightson (9,453 ft), the highest peak in the Santa Rita range.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="material-symbols-outlined text-ce-primary-container mr-4">
                pets
              </span>
              <div>
                <p className="font-label text-xs uppercase font-bold text-ce-on-surface">
                  Wildlife Corridor
                </p>
                <p className="text-[11px] text-ce-outline">
                  Bears, bobcats, jaguars, and over 200 bird species. The Santa Cruz Valley is a critical
                  wildlife migration corridor.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="material-symbols-outlined text-ce-primary-container mr-4">
                history
              </span>
              <div>
                <p className="font-label text-xs uppercase font-bold text-ce-on-surface">
                  Historic Landmark
                </p>
                <p className="text-[11px] text-ce-outline">
                  Adobe structures dating to 1904. Kentucky Camp is maintained by the Forest Service and
                  open for exploration.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Trail Notes */}
      <section className="bg-ce-surface-container py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Required Kit */}
          <div>
            <div className="flex items-center mb-6">
              <span className="material-symbols-outlined text-ce-secondary mr-3">backpack</span>
              <h4 className="font-headline text-xl font-bold uppercase tracking-widest">
                Required Kit
              </h4>
            </div>
            <div className="font-label text-[10px] space-y-4 text-ce-on-surface-variant">
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">HYDRATION</p>
                <p>Minimum 2L capacity. Electrolyte tabs recommended. Aid stations at ~8mi intervals.</p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">TRACTION</p>
                <p>Trail running shoes with good grip. Gaiters optional for rocky sections.</p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">NAVIGATION</p>
                <p>
                  GPS device strongly recommended for 50K. Headlamp required for pre-dawn start.
                </p>
              </div>
            </div>
          </div>

          {/* Atmo Conditions */}
          <div>
            <div className="flex items-center mb-6">
              <span className="material-symbols-outlined text-ce-secondary mr-3">thermostat</span>
              <h4 className="font-headline text-xl font-bold uppercase tracking-widest">
                Atmo Conditions
              </h4>
            </div>
            <div className="font-label text-[10px] space-y-4 text-ce-on-surface-variant">
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">THERMAL SWING</p>
                <p>
                  Dawn: ~45&deg;F // Afternoon: ~85&deg;F. Layers essential for desert temperature swing.
                </p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">UV EXPOSURE</p>
                <p>High altitude desert sun. Full sun protection required — hat, sleeves, sunscreen.</p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">MONSOON WINDOW</p>
                <p>Summer events may see afternoon thunderstorms. Course adjustments if needed.</p>
              </div>
            </div>
          </div>

          {/* Altimetry Logs */}
          <div>
            <div className="flex items-center mb-6">
              <span className="material-symbols-outlined text-ce-secondary mr-3">altitude</span>
              <h4 className="font-headline text-xl font-bold uppercase tracking-widest">
                Altimetry Logs
              </h4>
            </div>
            <div className="font-label text-[10px] space-y-4 text-ce-on-surface-variant">
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">ELEVATION BAND</p>
                <p>4,800 ft to 6,000 ft. Moderate altitude — no acclimatization typically required.</p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">GRADIENT STATS</p>
                <p>Total climb 4,784 ft over 32.5 miles. Sustained grades on Greaterville Trail.</p>
              </div>
              <div className="border-l border-ce-outline-variant pl-4 py-1">
                <p className="text-ce-secondary font-bold">TERRAIN MIX</p>
                <p>40% forest road, 35% single track, 25% technical trail. Varied surface throughout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
