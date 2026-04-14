import * as net from "net";
import * as dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

/* ── Email Permutator ─────────────────────────────────────────────── */

export function generatePermutations(
  firstName: string,
  lastName: string,
  domain: string
): string[] {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName.toLowerCase().replace(/[^a-z]/g, "");

  if (!f || !l || !domain) return [];

  const fi = f[0]; // first initial
  const li = l[0]; // last initial

  return [
    // Most common patterns first
    `${f}.${l}@${domain}`,
    `${f}${l}@${domain}`,
    `${fi}${l}@${domain}`,
    `${f}@${domain}`,
    `${f}_${l}@${domain}`,
    `${f}${li}@${domain}`,
    `${fi}.${l}@${domain}`,
    `${l}.${f}@${domain}`,
    `${l}${f}@${domain}`,
    `${l}@${domain}`,
    `${fi}${f[1] || ""}${l}@${domain}`,
    `${f}-${l}@${domain}`,
    `${l}${fi}@${domain}`,
    `${l}_${f}@${domain}`,
    `${l}.${fi}@${domain}`,
    // Generic patterns
    `info@${domain}`,
    `contact@${domain}`,
    `office@${domain}`,
    `hello@${domain}`,
    `admin@${domain}`,
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
}

/* ── MX Verification (works anywhere, no port 25 needed) ──────────── */

export interface MxVerifyResult {
  email: string;
  valid: boolean;
  mxHost: string | null;
  hasMx: boolean;
  error?: string;
}

export async function verifyEmailMx(email: string): Promise<MxVerifyResult> {
  const domain = email.split("@")[1];
  if (!domain) {
    return { email, valid: false, mxHost: null, hasMx: false, error: "invalid format" };
  }

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { email, valid: false, mxHost: null, hasMx: false, error: "invalid format" };
  }

  try {
    const records = await resolveMx(domain);
    if (!records || records.length === 0) {
      return { email, valid: false, mxHost: null, hasMx: false, error: "no MX records" };
    }

    records.sort((a, b) => a.priority - b.priority);
    return {
      email,
      valid: true,
      mxHost: records[0].exchange,
      hasMx: true,
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { email, valid: false, mxHost: null, hasMx: false, error: "domain not found" };
    }
    return { email, valid: false, mxHost: null, hasMx: false, error: `DNS error: ${code}` };
  }
}

/* ── SMTP Verifier ────────────────────────────────────────────────── */

interface VerifyResult {
  email: string;
  valid: boolean;
  catchAll: boolean;
  error?: string;
}

async function getMxHost(domain: string): Promise<string | null> {
  try {
    const records = await resolveMx(domain);
    if (!records || records.length === 0) return null;
    // Sort by priority (lower = higher priority)
    records.sort((a, b) => a.priority - b.priority);
    return records[0].exchange;
  } catch {
    return null;
  }
}

function smtpCheck(mxHost: string, fromEmail: string, toEmail: string, timeoutMs = 10000): Promise<{ accepted: boolean; response: string }> {
  return new Promise((resolve) => {
    let resolved = false;
    let response = "";

    const socket = net.createConnection(25, mxHost);
    socket.setTimeout(timeoutMs);

    let step = 0;

    function finish(accepted: boolean) {
      if (resolved) return;
      resolved = true;
      try { socket.write("QUIT\r\n"); } catch { /* ignore */ }
      try { socket.destroy(); } catch { /* ignore */ }
      resolve({ accepted, response });
    }

    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));

    socket.on("data", (data) => {
      const line = data.toString();
      response += line;

      if (step === 0 && line.startsWith("220")) {
        // Server greeting — send HELO
        socket.write(`HELO mail.gorunrabbit.com\r\n`);
        step = 1;
      } else if (step === 1 && line.startsWith("250")) {
        // HELO accepted — send MAIL FROM
        socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
        step = 2;
      } else if (step === 2 && line.startsWith("250")) {
        // MAIL FROM accepted — send RCPT TO (this is the key check)
        socket.write(`RCPT TO:<${toEmail}>\r\n`);
        step = 3;
      } else if (step === 3) {
        // RCPT TO response — 250 = exists, 550 = doesn't exist
        if (line.startsWith("250")) {
          finish(true);
        } else {
          finish(false);
        }
      } else if (line.startsWith("4") || line.startsWith("5")) {
        // Error at any step
        finish(false);
      }
    });
  });
}

export async function verifyEmail(email: string): Promise<VerifyResult> {
  const domain = email.split("@")[1];
  if (!domain) return { email, valid: false, catchAll: false, error: "invalid format" };

  const mxHost = await getMxHost(domain);
  if (!mxHost) return { email, valid: false, catchAll: false, error: "no MX records" };

  try {
    const result = await smtpCheck(mxHost, "verify@gorunrabbit.com", email);
    return {
      email,
      valid: result.accepted,
      catchAll: false,
      error: result.accepted ? undefined : "mailbox not found",
    };
  } catch (err) {
    return {
      email,
      valid: false,
      catchAll: false,
      error: err instanceof Error ? err.message : "SMTP error",
    };
  }
}

/* ── Catch-all detection ──────────────────────────────────────────── */

async function isCatchAll(domain: string): Promise<boolean> {
  // Test with a random nonsense address
  const randomUser = `xyztest${Math.random().toString(36).slice(2, 8)}`;
  const result = await verifyEmail(`${randomUser}@${domain}`);
  return result.valid; // If random address is "valid", it's catch-all
}

/* ── Main email finder ────────────────────────────────────────────── */

export interface FindEmailResult {
  email: string | null;
  allTested: { email: string; valid: boolean }[];
  catchAll: boolean;
  domain: string;
}

export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<FindEmailResult> {
  const result: FindEmailResult = {
    email: null,
    allTested: [],
    catchAll: false,
    domain,
  };

  // Check for catch-all first
  const catchAll = await isCatchAll(domain);
  result.catchAll = catchAll;

  if (catchAll) {
    // If catch-all, we can't verify individual emails
    // Return the most likely pattern as a best guess
    const permutations = generatePermutations(firstName, lastName, domain);
    result.email = permutations[0] || null; // first.last@ is most common
    result.allTested = permutations.slice(0, 5).map((e) => ({ email: e, valid: true }));
    return result;
  }

  // Generate and test permutations
  const permutations = generatePermutations(firstName, lastName, domain);

  // Test personal patterns first (skip generic ones unless nothing else works)
  const personalPatterns = permutations.filter(
    (e) => !["info@", "contact@", "office@", "hello@", "admin@"].some((p) => e.startsWith(p))
  );
  const genericPatterns = permutations.filter(
    (e) => ["info@", "contact@", "office@", "hello@", "admin@"].some((p) => e.startsWith(p))
  );

  // Test personal patterns with delay between each
  for (const email of personalPatterns) {
    const verified = await verifyEmail(email);
    result.allTested.push({ email, valid: verified.valid });

    if (verified.valid) {
      result.email = email;
      return result; // Found it, stop testing
    }

    // Small delay to avoid getting blocked
    await new Promise((r) => setTimeout(r, 300));
  }

  // If no personal email found, try generic
  for (const email of genericPatterns) {
    const verified = await verifyEmail(email);
    result.allTested.push({ email, valid: verified.valid });

    if (verified.valid) {
      result.email = email;
      return result;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return result;
}

/* ── Extract domain from URL ──────────────────────────────────────── */

export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

/* ── Parse name into first/last ───────────────────────────────────── */

export function parseName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return null;

  // Handle "Last, First" format
  if (parts[0].endsWith(",")) {
    return { firstName: parts[1], lastName: parts[0].replace(",", "") };
  }

  // Skip prefixes
  const prefixes = ["mr", "mrs", "ms", "dr", "prof", "judge", "hon", "esq"];
  let start = 0;
  if (prefixes.includes(parts[0].toLowerCase().replace(".", ""))) start = 1;

  // Skip suffixes
  const suffixes = ["jr", "sr", "ii", "iii", "iv", "esq", "phd", "md", "jd"];
  let end = parts.length;
  while (end > start + 1 && suffixes.includes(parts[end - 1].toLowerCase().replace(".", ""))) end--;

  const nameParts = parts.slice(start, end);
  if (nameParts.length < 2) return null;

  return {
    firstName: nameParts[0],
    lastName: nameParts[nameParts.length - 1],
  };
}
