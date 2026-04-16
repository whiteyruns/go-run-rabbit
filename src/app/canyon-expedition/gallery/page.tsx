"use client";

import AuthGate from "../components/AuthGate";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GalleryPage from "../components/GalleryPage";

export default function CanyonExpeditionGallery() {
  return (
    <AuthGate>
      <Nav />
      <main className="pt-32 pb-24 px-8 md:px-16 max-w-[1600px] mx-auto">
        <GalleryPage />
      </main>
      <Footer />
    </AuthGate>
  );
}
