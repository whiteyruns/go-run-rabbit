"use client";

/**
 * Shared top nav for every consumer-facing Oddyssey wireframe page.
 *
 * Replaces the bespoke per-page navs (.od-nav on the wireframe home,
 * .m-nav on Manor, .n-nav on Noir, .p-nav on Private) that used to
 * make navigation between them feel like jumping between three
 * different sites.
 *
 * Always exposes the universal trio (Manor / Noir / Private Events)
 * pointing at their flagship URLs. Pages with their own in-page
 * anchors (Gallery / FAQ on Manor, Events / Bottles on Noir, About
 * on home) pass them via the `pageItems` prop — the component
 * renders them in the same row with the same styling so they don't
 * visually disrupt the consistent shell.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type ActivePage = "home" | "manor" | "noir" | "private";

export interface PageItem {
  label: string;
  // Either a scrollTo (string id), an onClick, or an href. Exactly
  // one wins — scrollTo > onClick > href, evaluated in that order.
  scrollTo?: string;
  onClick?: () => void;
  href?: string;
}

export interface OddysseyTopNavProps {
  active: ActivePage;
  // Page-specific anchors rendered inline before the CTA.
  pageItems?: PageItem[];
  // CTA text + behavior. Defaults to "Get Tickets" with no handler.
  ctaLabel?: string;
  ctaAction?: () => void;
  ctaHref?: string;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function navItemAction(item: PageItem, close?: () => void): {
  onClick: () => void;
  href?: string;
} {
  return {
    onClick: () => {
      if (item.scrollTo) scrollToId(item.scrollTo);
      else if (item.onClick) item.onClick();
      close?.();
    },
    href: item.href,
  };
}

export function OddysseyTopNav({
  active,
  pageItems = [],
  ctaLabel = "Get Tickets",
  ctaAction,
  ctaHref,
}: OddysseyTopNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll while mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{topNavStyles}</style>
      <nav className={`otn-nav ${scrolled ? "otn-scrolled" : ""}`}>
        <Link href="/oddyssey" className="otn-logo" aria-label="Oddyssey home">
          <Image src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" width={129} height={62} priority />
        </Link>
        <ul className="otn-links">
          <li>
            <Link href="/oddyssey-manor/manor" className={active === "manor" ? "active" : ""}>Manor</Link>
          </li>
          <li>
            <Link href="/oddyssey-manor/noir" className={active === "noir" ? "active" : ""}>Noir</Link>
          </li>
          <li>
            <Link href="/oddyssey-manor/private" className={active === "private" ? "active" : ""}>Private Events</Link>
          </li>
          {pageItems.map((item) => {
            const { onClick, href } = navItemAction(item);
            return (
              <li key={item.label}>
                {href ? (
                  <Link href={href}>{item.label}</Link>
                ) : (
                  <a onClick={onClick} role="button" tabIndex={0}>{item.label}</a>
                )}
              </li>
            );
          })}
          <li>
            {ctaHref ? (
              <Link href={ctaHref} className="otn-cta">{ctaLabel}</Link>
            ) : (
              <a className="otn-cta" onClick={ctaAction} role="button" tabIndex={0}>{ctaLabel}</a>
            )}
          </li>
        </ul>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className={`otn-hamburger ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {mobileOpen && (
        <div className="otn-mobile" onClick={() => setMobileOpen(false)}>
          <Link href="/oddyssey-manor/manor" className={active === "manor" ? "active" : ""}>Manor</Link>
          <Link href="/oddyssey-manor/noir" className={active === "noir" ? "active" : ""}>Noir</Link>
          <Link href="/oddyssey-manor/private" className={active === "private" ? "active" : ""}>Private Events</Link>
          {pageItems.map((item) => {
            const { onClick, href } = navItemAction(item, () => setMobileOpen(false));
            return href ? (
              <Link key={item.label} href={href}>{item.label}</Link>
            ) : (
              <a key={item.label} onClick={onClick} role="button" tabIndex={0}>{item.label}</a>
            );
          })}
          {ctaHref ? (
            <Link href={ctaHref} className="otn-cta">{ctaLabel}</Link>
          ) : (
            <a
              className="otn-cta"
              role="button"
              tabIndex={0}
              onClick={() => { ctaAction?.(); setMobileOpen(false); }}
            >
              {ctaLabel}
            </a>
          )}
        </div>
      )}
    </>
  );
}

const topNavStyles = `
.otn-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 clamp(20px, 4vw, 60px); height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.5s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.5s, border-color 0.5s;
  background: linear-gradient(180deg, rgba(6,6,6,0.55) 0%, rgba(6,6,6,0) 100%);
}
.otn-nav.otn-scrolled {
  background: rgba(6,6,6,0.88);
  backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.otn-logo { display: flex; align-items: center; transition: opacity 0.3s; }
.otn-logo:hover { opacity: 0.7; }
.otn-logo img { height: 32px; width: auto; display: block; }
.otn-links { display: flex; align-items: center; gap: 36px; list-style: none; margin: 0; padding: 0; }
.otn-links a {
  font-size: 11px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;
  color: #e8e4dd; cursor: pointer; transition: color 0.3s; position: relative;
  text-decoration: none;
}
.otn-links a::after {
  content: ''; position: absolute; bottom: -6px; left: 0; width: 0; height: 1px;
  background: #c9a84c; transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
}
.otn-links a:hover { color: #fff; }
.otn-links a:hover::after { width: 100%; }
.otn-links a.active { color: #c9a84c; }
.otn-links a.active::after { width: 100%; }
.otn-cta {
  background: #c9a84c; color: #060606 !important; padding: 10px 22px;
  font-size: 10px !important; font-weight: 500 !important; letter-spacing: 3px !important;
  transition: background 0.3s, transform 0.3s;
}
.otn-cta::after { display: none !important; }
.otn-cta:hover { background: #d4b85e; transform: translateY(-1px); color: #060606 !important; }

.otn-hamburger {
  display: none; flex-direction: column; gap: 5px; cursor: pointer;
  padding: 8px; background: transparent; border: none; z-index: 1001;
}
.otn-hamburger span {
  display: block; width: 24px; height: 1px; background: #e8e4dd;
  transition: transform 0.3s, opacity 0.3s;
}
.otn-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.otn-hamburger.open span:nth-child(2) { opacity: 0; }
.otn-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

.otn-mobile {
  position: fixed; inset: 72px 0 0 0; background: rgba(6,6,6,0.97);
  backdrop-filter: blur(24px); z-index: 999;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 28px; padding: 40px;
}
.otn-mobile a {
  font-size: 18px; letter-spacing: 4px; text-transform: uppercase; color: #e8e4dd;
  text-decoration: none; cursor: pointer;
}
.otn-mobile a.active { color: #c9a84c; }
.otn-mobile a.otn-cta {
  background: #c9a84c; color: #060606 !important; padding: 14px 36px;
  font-size: 12px; font-weight: 500;
}

@media (max-width: 800px) {
  .otn-links { display: none; }
  .otn-hamburger { display: flex; }
}
`;
