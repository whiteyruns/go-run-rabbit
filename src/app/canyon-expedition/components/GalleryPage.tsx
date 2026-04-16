"use client";

import Image from "next/image";

const GALLERY_ITEMS = [
  { src: "ranch-gate.jpg", cam: "CAM_01", label: "RANCH_GATE", aspect: "aspect-[3/4]" },
  { src: "red-canyon.jpg", cam: "CAM_02", label: "RED_CANYON", aspect: "aspect-video" },
  { src: "longhorn.png", cam: "CAM_03", label: "WILDLIFE_ALPHA", aspect: "aspect-square" },
  { src: "bedroom.jpg", cam: "CAM_04", label: "QUARTERS", aspect: "aspect-[4/5]" },
  { src: "donkeys.png", cam: "CAM_05", label: "FAUNA_LOG", aspect: "aspect-square" },
  { src: "game-room.jpg", cam: "CAM_06", label: "SOCIAL_HUB", aspect: "aspect-video" },
  { src: "horses-running.jpg", cam: "CAM_07", label: "EQUINE_RECON", aspect: "aspect-[3/4]" },
  { src: "trail-ridgeline.jpg", cam: "CAM_08", label: "RIDGELINE", aspect: "aspect-square" },
  { src: "milky-way.jpg", cam: "CAM_09", label: "CELESTIAL_NAV", aspect: "aspect-[16/9]" },
  { src: "sunset-mountains.jpg", cam: "CAM_10", label: "SUNSET_SECTOR", aspect: "aspect-[4/5]" },
  { src: "pond-dock.png", cam: "CAM_11", label: "WATER_SOURCE", aspect: "aspect-video" },
  { src: "mountains-panorama.jpg", cam: "CAM_12", label: "PANORAMA", aspect: "aspect-square" },
  { src: "horse-field.png", cam: "CAM_13", label: "EQUINE_BRAVO", aspect: "aspect-[3/4]" },
  { src: "trail-sunset.jpg", cam: "CAM_14", label: "TRAIL_DUSK", aspect: "aspect-video" },
  { src: "great-room.jpg", cam: "CAM_15", label: "THE_LODGE", aspect: "aspect-square" },
  { src: "horse-portrait.jpg", cam: "CAM_16", label: "EQUINE_CLOSE", aspect: "aspect-[4/5]" },
  { src: "living-room.jpg", cam: "CAM_17", label: "INTERIOR_SCAN", aspect: "aspect-video" },
  { src: "barn-arena.jpg", cam: "CAM_18", label: "STRUCTURE_A", aspect: "aspect-[3/4]" },
  { src: "pond-landscape.jpg", cam: "CAM_19", label: "TERRAIN_FINAL", aspect: "aspect-square" },
];

export default function GalleryPage() {
  return (
    <main className="pt-32 pb-24 px-8 md:px-16 max-w-[1600px] mx-auto">
      {/* Masonry CSS */}
      <style jsx>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 3;
          }
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
        }
      `}</style>

      {/* Hero */}
      <section className="mb-24 border-l-4 border-ce-primary-container pl-8">
        <h1 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
          THE GALLERY
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p className="font-label text-ce-secondary uppercase tracking-[0.2em] text-sm md:text-base">
            Field documentation from the Santa Rita Mountains
          </p>
          <div className="font-label text-[10px] text-ce-on-surface-variant/40 uppercase tracking-widest space-y-1">
            <p>LAT // 31.6703° N</p>
            <p>LONG // 110.7410° W</p>
            <p>ALT // 5,450 FT</p>
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="masonry-grid w-full">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.cam}
            className="masonry-item group relative overflow-hidden bg-ce-surface-container-highest"
          >
            <Image
              src={`/images/apache-springs/${item.src}`}
              alt={`${item.label} - Apache Springs Ranch`}
              width={600}
              height={400}
              className={`w-full object-cover ${item.aspect}`}
              style={{
                filter: "grayscale(100%)",
                transition: "filter 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.filter = "grayscale(100%)";
              }}
            />
            <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-ce-surface-lowest/80 backdrop-blur-sm">
              <span className="font-label text-[10px] text-ce-primary tracking-widest uppercase">
                {item.cam} {"// "}{item.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Editorial Footer */}
      <section className="mt-32 pt-16 border-t border-ce-outline-variant/20 flex flex-col md:flex-row gap-16">
        <div className="flex-1">
          <h3 className="font-headline text-3xl uppercase font-bold text-ce-on-surface mb-6">
            THE STILLNESS OF APACHE SPRINGS
          </h3>
          <div className="space-y-6 font-body text-ce-on-surface-variant leading-relaxed max-w-2xl">
            <p>
              The stillness of Apache Springs offers unique wildlife encounters
              — longhorns grazing at dawn, horses running through open pasture,
              and the kind of night sky you forgot existed. Every image here is a
              record of the land as it is — unfiltered, uncompromised, and
              unchanged by anything but time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
