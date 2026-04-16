import { marshmelloApr2 } from "./marshmello-apr2";
import { diploOct27 } from "./diplo-oct27";
import type { EventDataset } from "./types";

// Newest first — picker default is index 0.
export const EVENTS: EventDataset[] = [marshmelloApr2, diploOct27];

export const findEvent = (id: string): EventDataset | undefined =>
  EVENTS.find((e) => e.id === id);
