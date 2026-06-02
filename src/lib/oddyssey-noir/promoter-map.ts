/**
 * Code → promoter mapping for the Oddyssey Noir promo redemption report.
 *
 * Source of truth for "who gets paid what when their code is redeemed."
 * The Promo Report admin page (/oddyssey-manor/admin/promo-report) flags any
 * code present in the Tixr audit export but missing here, so adding new
 * promoters is incremental: edit this file, push, redeploy.
 *
 * Rate semantics:
 *   rate = dollars per redemption (each row in the audit with this code = 1 unit)
 *   rate = 0 for non-promoter codes (GM/Guest/Cross-Comp) so they tally but
 *   don't show up in the invoice section.
 */

export interface PromoterMapEntry {
  code: string;
  displayName: string;
  rate: number;
  isPromoter: boolean;
}

export const PROMOTER_MAP: PromoterMapEntry[] = [
  // Promoters — confirmed against Brandon's notepad tally for 5/29 + 5/30 weekend.
  { code: 'ATCOMPNOIR17', displayName: 'Ayiro',         rate: 5, isPromoter: true },
  { code: 'RTCOMPNOIR17', displayName: 'Ryan T',        rate: 5, isPromoter: true },
  { code: 'SSCOMPNOIR17', displayName: 'Saturn',        rate: 5, isPromoter: true },
  { code: 'CDCOMPNOIR',   displayName: 'Christina D',   rate: 5, isPromoter: true },
  { code: 'NHCOMPNOIR17', displayName: 'Nia H',         rate: 5, isPromoter: true },
  { code: 'TABCOMPNOIR',  displayName: 'Tyler Anthony', rate: 5, isPromoter: true },

  // Non-promoter codes — surfaced in the report for visibility, no incentive owed.
  { code: 'NOIRGUEST',      displayName: 'Guest List',    rate: 0, isPromoter: false },
  { code: 'BPGMODDYCOMP',   displayName: 'GM Comp (BP)',  rate: 0, isPromoter: false },
  { code: 'BPCOMPNOIR17',   displayName: 'Brandon P',     rate: 0, isPromoter: false },
  { code: 'SGCOMPNOIR17',   displayName: 'Stevie G',      rate: 0, isPromoter: false },
  { code: 'DJNECOCOMPNOIR', displayName: 'DJ Neco Comp',  rate: 0, isPromoter: false },
];

const byCode = new Map<string, PromoterMapEntry>(
  PROMOTER_MAP.map((e) => [e.code.toUpperCase(), e]),
);

export function lookupCode(code: string): PromoterMapEntry | null {
  return byCode.get(code.trim().toUpperCase()) ?? null;
}
