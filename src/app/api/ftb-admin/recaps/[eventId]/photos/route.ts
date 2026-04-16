import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, unlink, rm } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const execFileP = promisify(execFile);

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

type Slot = "hero" | "polaroid" | "portrait" | "gallery";

interface Photo {
  slug: string;
  alt: string;
  credit: string;
  caption?: string;
}

interface Photos {
  hero?: Photo;
  polaroid?: Photo;
  portrait?: Photo;
  gallery: Photo[];
}

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// POST — upload photo, resize via sips, attach to recap
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
  });
  if (!recap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const slot = String(form.get("slot") ?? "") as Slot;
  const slugRaw = String(form.get("slug") ?? "");
  const alt = String(form.get("alt") ?? "");
  const credit = String(form.get("credit") ?? "");
  const caption = form.get("caption") ? String(form.get("caption")) : undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }
  if (!["hero", "polaroid", "portrait", "gallery"].includes(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }
  if (!slugRaw || !alt || !credit) {
    return NextResponse.json(
      { error: "slug, alt, credit required" },
      { status: 400 },
    );
  }

  const slug = sanitizeSlug(slugRaw);
  const dir = path.join(
    process.cwd(),
    "public",
    "feed-the-block",
    "img",
    params.eventId,
  );
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const tmpPath = path.join(dir, `${slug}-orig`);
  await writeFile(tmpPath, bytes);

  try {
    for (const size of [640, 1280, 1920]) {
      const out = path.join(dir, `${slug}-${size}.jpg`);
      await execFileP("sips", [
        "-Z",
        String(size),
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        "78",
        tmpPath,
        "--out",
        out,
      ]);
    }
  } catch (e) {
    console.error("sips resize failed:", e);
    await unlink(tmpPath).catch(() => {});
    return NextResponse.json(
      { error: "Image resize failed (sips not available?)" },
      { status: 500 },
    );
  }
  await unlink(tmpPath).catch(() => {});

  const existing: Photos = JSON.parse(recap.photos);
  const photoEntry: Photo = { slug, alt, credit, ...(caption ? { caption } : {}) };

  let updated: Photos;
  if (slot === "gallery") {
    const gallery = existing.gallery.filter((p) => p.slug !== slug);
    gallery.push(photoEntry);
    updated = { ...existing, gallery };
  } else {
    updated = { ...existing, [slot]: photoEntry };
  }

  await prisma.ftbRecap.update({
    where: { eventId: params.eventId },
    data: { photos: JSON.stringify(updated) },
  });

  return NextResponse.json({ photos: updated });
}

// DELETE — remove photo from a slot (body: { slot, slug })
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
  });
  if (!recap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { slot, slug } = await req.json();
  if (!["hero", "polaroid", "portrait", "gallery"].includes(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const existing: Photos = JSON.parse(recap.photos);
  let targetSlug: string | undefined;
  let updated: Photos;
  if (slot === "gallery") {
    if (!slug) {
      return NextResponse.json({ error: "slug required for gallery" }, { status: 400 });
    }
    targetSlug = slug;
    updated = {
      ...existing,
      gallery: existing.gallery.filter((p) => p.slug !== slug),
    };
  } else {
    const key = slot as "hero" | "polaroid" | "portrait";
    targetSlug = existing[key]?.slug;
    updated = { ...existing };
    delete updated[key];
  }

  if (targetSlug) {
    const dir = path.join(
      process.cwd(),
      "public",
      "feed-the-block",
      "img",
      params.eventId,
    );
    for (const size of [640, 1280, 1920]) {
      await rm(path.join(dir, `${targetSlug}-${size}.jpg`), {
        force: true,
      }).catch(() => {});
    }
  }

  await prisma.ftbRecap.update({
    where: { eventId: params.eventId },
    data: { photos: JSON.stringify(updated) },
  });

  return NextResponse.json({ photos: updated });
}
