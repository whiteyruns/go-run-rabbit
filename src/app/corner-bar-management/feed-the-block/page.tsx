"use client";

import Link from "next/link";
import BlockPartyPage from "@/app/(internal)/dashboard/block-party/page";

export default function CbmFeedTheBlockPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-8 pt-6 flex items-center justify-between">
        <Link
          href="/corner-bar-management"
          className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors"
        >
          &larr; Corner Bar Management
        </Link>
        <Link
          href="/corner-bar-management/feed-the-block/recaps"
          className="px-4 py-2 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85"
        >
          Manage Recaps
        </Link>
      </div>
      <BlockPartyPage />
      <div className="max-w-7xl mx-auto px-8 pb-10">
        <p className="text-on-surface-variant text-xs">
          Also available:{" "}
          <Link
            href="/feed-the-block"
            className="text-neon-cyan hover:underline"
            target="_blank"
          >
            Stakeholder wireframe &rarr;
          </Link>
        </p>
      </div>
    </>
  );
}
