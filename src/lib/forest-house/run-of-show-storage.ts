import { promises as fs } from "node:fs";
import path from "node:path";
import { Mutex } from "async-mutex";
import {
  RunOfShowDataSchema,
  type RunOfShowData,
} from "./run-of-show-data";
import {
  RUN_OF_SHOW_SEEDS,
  isKnownEventSlug,
  type EventSlug,
} from "./run-of-show-seed";

const ROS_DIR = path.join(
  process.cwd(),
  "data",
  "forest-house",
  "run-of-show",
);

const mutex = new Mutex();

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function pathFor(slug: EventSlug): string {
  return path.join(ROS_DIR, `${slug}.json`);
}

// Optional fields that are allowed to inherit from the event seed when a
// runtime JSON file predates the field's existence (i.e. the key is
// entirely absent from the saved JSON). Present keys — even empty
// arrays / nulls — are preserved as-is so the user can explicitly clear
// a section.
const INHERITABLE_OPTIONAL_KEYS = [
  "eventSubtitle",
  "talent",
  "addOns",
  "power",
  "vehicleSpecs",
  "header",
  "hideAudio",
  "hideLasers",
  "hidePower",
] as const;

export async function readRunOfShow(slug: string): Promise<RunOfShowData> {
  if (!isKnownEventSlug(slug)) {
    throw new Error(`Unknown event slug: ${slug}`);
  }
  return mutex.runExclusive(async () => {
    const file = pathFor(slug);
    if (!(await fileExists(file))) {
      return RUN_OF_SHOW_SEEDS[slug];
    }
    const raw = await fs.readFile(file, "utf8");
    const rawObj = JSON.parse(raw) as Record<string, unknown>;
    const seed = RUN_OF_SHOW_SEEDS[slug] as unknown as Record<string, unknown>;
    for (const key of INHERITABLE_OPTIONAL_KEYS) {
      if (!(key in rawObj) && seed[key] !== undefined) {
        rawObj[key] = seed[key];
      }
    }
    const parsed = RunOfShowDataSchema.safeParse(rawObj);
    if (!parsed.success) {
      throw new Error(
        `Invalid run-of-show JSON for ${slug}: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  });
}

export async function writeRunOfShow(
  slug: string,
  data: RunOfShowData,
): Promise<void> {
  if (!isKnownEventSlug(slug)) {
    throw new Error(`Unknown event slug: ${slug}`);
  }
  return mutex.runExclusive(async () => {
    await fs.mkdir(ROS_DIR, { recursive: true });
    const file = pathFor(slug);
    const tmp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await fs.rename(tmp, file);
  });
}
