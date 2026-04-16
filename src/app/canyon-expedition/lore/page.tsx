"use client";

import AuthGate from "../components/AuthGate";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import LorePage from "../components/LorePage";

export default function CanyonExpeditionLore() {
  return (
    <AuthGate>
      <Nav />
      <main className="pt-16">
        <LorePage />
      </main>
      <Footer />
    </AuthGate>
  );
}
