"use client";

import AuthGate from "./auth-gate";

export default function FeedTheBlockPage() {
  return (
    <AuthGate>
      <iframe
        src="/feed-the-block/index.html"
        className="w-full border-none"
        style={{ height: "100vh", minHeight: "100vh" }}
        title="Feed The Block"
      />
    </AuthGate>
  );
}
