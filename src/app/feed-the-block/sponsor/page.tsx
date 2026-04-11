"use client";

import AuthGate from "../auth-gate";

export default function FeedTheBlockSponsorPage() {
  return (
    <AuthGate>
      <iframe
        src="/feed-the-block/sponsor.html"
        className="w-full border-none"
        style={{ height: "100vh", minHeight: "100vh" }}
        title="Feed The Block — Sponsorship Opportunities"
      />
    </AuthGate>
  );
}
