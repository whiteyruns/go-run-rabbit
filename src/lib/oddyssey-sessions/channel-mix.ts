// Pure, client-safe pieces extracted from loader.ts — types + the
// channel-mix computation. Kept fs-free so client components can import
// without dragging Node built-ins into the browser bundle.

export interface TicketGroupReport {
  ticket_group_name: string;
  reserved: number | null;
  redeemed: number | null;
  gross_revenue: number | null;
  net_to_bank: number | null;
  tickets_paid: number | null;
  tickets_free: number | null;
  tickets_refunded: number | null;
  revenue_refunded: number | null;
}

export interface ChannelMix {
  total_gross: number;
  direct_gross: number;
  third_party_gross: number;
  third_party_pct: number; // 0-1
  commission_rate: number | null; // 0-1, weighted across lines
  commission_amount: number;
  net_to_oddyssey: number;
  third_party_lines: {
    name: string;
    gross: number;
    rate: number | null;
    commission: number;
    net: number;
  }[];
}

const THIRD_PARTY_RE = /third[\s-]?party|commission/i;
const RATE_RE = /(\d+(?:\.\d+)?)\s*%/;

export function computeChannelMix(groups: TicketGroupReport[]): ChannelMix {
  let totalGross = 0;
  let thirdPartyGross = 0;
  let commissionSum = 0;
  let rateWeightedSum = 0;
  const lines: ChannelMix["third_party_lines"] = [];

  for (const g of groups) {
    const gross = g.gross_revenue ?? 0;
    totalGross += gross;
    if (!THIRD_PARTY_RE.test(g.ticket_group_name)) continue;
    thirdPartyGross += gross;
    const rateMatch = g.ticket_group_name.match(RATE_RE);
    const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 : null;
    const commission = rate != null ? gross * rate : 0;
    commissionSum += commission;
    if (rate != null) rateWeightedSum += gross * rate;
    lines.push({
      name: g.ticket_group_name,
      gross,
      rate,
      commission,
      net: gross - commission,
    });
  }

  const directGross = totalGross - thirdPartyGross;
  const weightedRate = thirdPartyGross > 0 ? rateWeightedSum / thirdPartyGross : null;

  return {
    total_gross: totalGross,
    direct_gross: directGross,
    third_party_gross: thirdPartyGross,
    third_party_pct: totalGross > 0 ? thirdPartyGross / totalGross : 0,
    commission_rate: weightedRate,
    commission_amount: commissionSum,
    net_to_oddyssey: directGross + (thirdPartyGross - commissionSum),
    third_party_lines: lines,
  };
}
