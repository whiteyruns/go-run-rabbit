"use client";

import AuthGate from "./components/AuthGate";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";

export default function CanyonExpeditionHome() {
  return (
    <AuthGate>
      <Nav />
      <main className="relative">
        <HomePage />
      </main>
      <Footer />
    </AuthGate>
  );
}
