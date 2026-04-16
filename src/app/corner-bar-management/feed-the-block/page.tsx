"use client";

import Link from "next/link";
import BlockPartyPage from "@/app/(internal)/dashboard/block-party/page";

export default function CbmFeedTheBlockPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <Link
          href="/corner-bar-management"
          className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors"
        >
          &larr; Corner Bar Management
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
