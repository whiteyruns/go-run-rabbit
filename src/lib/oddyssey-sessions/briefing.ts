// Auto-generated GM briefing bullets — talking points the GM can use
// to speak about the evening. Built from summary + session-report
// totals + WoW + notes.

import type { SessionReport, SessionReportTotals } from "./loader";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export interface BriefingInput {
  venue: "manor" | "noir";
  date_label: string;
  totals?: SessionReportTotals; // from session report
  sessions?: SessionReport[];
  fallback_tickets?: number;
  fallback_revenue?: number;
  fallback_capacity_percent?: number;
  // Food / flags (Manor only, safe to pass 0)
  food_by_item?: { label: string; count: number }[];
  vip_parties?: number;
  note_parties?: number;
  walkups?: number;
  // WoW deltas
  wow?: {
    available: boolean;
    prior_date_label?: string;
    tickets?: number; // delta
    revenue?: number; // delta
    tickets_prior?: number;
  };
}

export function buildBriefing(input: BriefingInput): string[] {
  const bullets: string[] = [];
  const venueName = input.venue === "manor" ? "Manor" : "Noir";

  // Headline — tickets + revenue
  if (input.totals) {
    const { reserved, tickets_paid, tickets_free, gross_revenue, net_to_bank, capacity_percent, total_orders } = input.totals;
    const compPct = reserved > 0 ? Math.round((tickets_free / reserved) * 100) : 0;
    bullets.push(
      `${venueName} tonight: ${reserved} tickets reserved (${tickets_paid} paid, ${tickets_free} comps${compPct > 0 ? ` · ${compPct}%` : ""}) across ${total_orders} orders`
    );
    bullets.push(
      `Gross ${formatCurrency(gross_revenue)} · Net to Bank ${formatCurrency(net_to_bank)} · running ${(capacity_percent * 100).toFixed(0)}% of capacity`
    );
  } else {
    const tix = input.fallback_tickets ?? 0;
    const rev = input.fallback_revenue ?? 0;
    bullets.push(
      `${venueName} tonight: ${tix} tickets · ${formatCurrency(rev)} at list price`
    );
  }

  // Session highlights (Manor benefits most — 9 sessions)
  if (input.sessions && input.sessions.length > 1) {
    const sorted = [...input.sessions]
      .filter((s) => (s.data.reserved ?? 0) > 0)
      .sort((a, b) => (b.data.reserved ?? 0) - (a.data.reserved ?? 0));
    if (sorted.length > 0) {
      const top = sorted[0];
      bullets.push(
        `Busiest: ${top.time_label} with ${top.data.reserved} guests${top.data.gross_revenue ? ` · ${formatCurrency(top.data.gross_revenue)}` : ""}`
      );
    }
    const empty = input.sessions
      .filter((s) => (s.data.reserved ?? 0) === 0)
      .map((s) => s.time_label);
    if (empty.length > 0 && empty.length < input.sessions.length) {
      bullets.push(`Empty slots: ${empty.join(", ")}`);
    }
  }

  // Food (Manor)
  if (input.food_by_item && input.food_by_item.length > 0) {
    const items = input.food_by_item
      .filter((i) => i.count > 0)
      .map((i) => `${i.count} ${i.label}`)
      .join(", ");
    bullets.push(`Food to plate: ${items}`);
  }

  // Flags
  const flagParts: string[] = [];
  if (input.vip_parties && input.vip_parties > 0) flagParts.push(`${input.vip_parties} VIP part${input.vip_parties === 1 ? "y" : "ies"} (Ultimate)`);
  if (input.note_parties && input.note_parties > 0) flagParts.push(`${input.note_parties} guest${input.note_parties === 1 ? "" : "s"} with allergy/request notes`);
  if (input.walkups && input.walkups > 0) flagParts.push(`${input.walkups} walk-up${input.walkups === 1 ? "" : "s"}`);
  if (flagParts.length > 0) bullets.push(flagParts.join(" · "));

  // WoW
  if (input.wow?.available && input.wow.prior_date_label) {
    const dTix = input.wow.tickets ?? 0;
    const dRev = input.wow.revenue ?? 0;
    const tixStr = dTix === 0 ? "flat" : `${dTix > 0 ? "+" : ""}${dTix}`;
    const revStr = dRev === 0 ? "" : ` · ${dRev > 0 ? "+" : "−"}${formatCurrency(Math.abs(dRev))}`;
    bullets.push(`vs. ${input.wow.prior_date_label}: ${tixStr} tickets${revStr}`);
  }

  return bullets;
}
