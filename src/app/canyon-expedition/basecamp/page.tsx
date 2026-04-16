"use client";

import AuthGate from "../components/AuthGate";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BasecampPage from "../components/BasecampPage";

export default function CanyonExpeditionBasecamp() {
  return (
    <AuthGate>
      <Nav />
      <main className="pt-20">
        <BasecampPage />
      </main>
      <Footer />
    </AuthGate>
  );
}
