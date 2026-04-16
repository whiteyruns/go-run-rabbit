"use client";

import AuthGate from "../components/AuthGate";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import RoutesPage from "../components/RoutesPage";

export default function CanyonExpeditionRoutes() {
  return (
    <AuthGate>
      <Nav />
      <main className="pt-20">
        <RoutesPage />
      </main>
      <Footer />
    </AuthGate>
  );
}
