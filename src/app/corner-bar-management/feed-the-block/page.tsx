"use client";

import Link from "next/link";

export default function FeedTheBlockPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-2">
        <Link
          href="/corner-bar-management"
          className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors"
        >
          &larr; Corner Bar Management
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
            CBM Events
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            FEED THE BLOCK
          </h1>
          <p className="text-on-surface-variant">
            Event wireframe — Wynn Nightlife x Corner Bar Management block party series
          </p>
        </div>
      </div>
      <div className="bg-surface-container rounded-xl overflow-hidden">
        <iframe
          src="/feed-the-block/index.html"
          className="w-full border-none rounded-xl"
          style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
          title="Feed The Block Wireframe"
        />
      </div>
    </div>
  );
}
