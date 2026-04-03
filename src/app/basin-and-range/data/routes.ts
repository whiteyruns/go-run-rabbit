/** CalTopo map with the confirmed route */
export const caltopoMapUrl = "https://caltopo.com/m/EQ31CR3";

export interface RoutePhase {
  label: string;
  title: string;
  miles: string;
  surface: string;
  description: string;
  trails: string[];
}

export const route = {
  title: "Red Rock Canyon to Boulder City",
  distance: "~102–108 miles",
  vert: "13,000–15,000 ft",
  surfaceMix: "~65% dirt singletrack, ~30% paved multi-use path, ~5% road",
  identity: "Desert point-to-point",
};

export const phases: RoutePhase[] = [
  {
    label: "Phase 1",
    title: "Red Rock Canyon NCA",
    miles: "~23",
    surface: "Trail + paved scenic drive",
    description:
      "Begin on the one-way Scenic Drive at first light, then climb into La Madre Springs, the White Rock Loop, and the Keystone Thrust before completing the drive south to SR-159.",
    trails: [
      "Scenic Drive (~7 mi, paved)",
      "La Madre Springs Trail (~1.8 mi)",
      "White Rock Loop Trail (~6.2 mi)",
      "Keystone Thrust Trail (~2.4 mi)",
      "Scenic Drive south to exit (~5–6 mi, paved)",
    ],
  },
  {
    label: "Phase 2",
    title: "Blue Diamond Hill",
    miles: "~8",
    surface: "Dirt singletrack",
    description:
      "Cross to the Blue Diamond Hill trail network — Fossil Trail, Cat-N-Hat, Ridge Ride, Eastern Outer Circuit. Fifty-plus miles of loops on BLM land with views over the entire Las Vegas basin.",
    trails: [
      "SR-159 to trailhead (~1 mi, road)",
      "Blue Diamond Hill loops (~7 mi, dirt)",
    ],
  },
  {
    label: "Phase 3",
    title: "Blue Diamond to Henderson",
    miles: "~10–12",
    surface: "Road + sidewalk",
    description:
      "The one road section. East on SR-160 to Las Vegas Blvd South, then south to pick up the St. Rose Parkway Trail at the I-15 corridor. The planned Red Rock Legacy Trail will eventually eliminate this gap.",
    trails: [
      "SR-160 east (~4–5 mi, road shoulder)",
      "Las Vegas Blvd South to St. Rose Pkwy (~5–7 mi, road/sidewalk)",
    ],
  },
  {
    label: "Phase 4",
    title: "Henderson Trail Network",
    miles: "~19",
    surface: "Paved multi-use path + dirt",
    description:
      "Continuous paved path system across Henderson. The Amargosa Trail transitions from pavement to dirt as it climbs into the McCullough foothills, delivering you to the McCullough Hills Trailhead on Mission Drive.",
    trails: [
      "St. Rose Parkway Trail (~8 mi, paved)",
      "Cactus Wren Trail (~1 mi, paved)",
      "Amargosa Trail, paved section (~7–8 mi)",
      "Amargosa Trail, dirt foothills (~2.5 mi)",
    ],
  },
  {
    label: "Phase 5",
    title: "McCullough Hills & Sloan Canyon",
    miles: "~15–28",
    surface: "Dirt singletrack",
    description:
      "The heart of the desert running. McCullough Hills Trail traverses Sloan Canyon NCA on exposed volcanic singletrack, then the Anthem East Trail runs the range to Shadow Canyon. Optional summit spurs on Black Mountain and Park Peak add vert and mileage.",
    trails: [
      "McCullough Hills Trail (~8.5 mi, dirt)",
      "Anthem East Trail (~7 mi, dirt)",
      "Black Mountain #404 out-and-back (~7.5 mi, optional)",
      "Park Peak #403 loop (~5.7 mi, optional)",
    ],
  },
  {
    label: "Phase 6",
    title: "Henderson Trails to RMLT",
    miles: "~13",
    surface: "Paved multi-use path",
    description:
      "Return from McCullough foothills to the Amargosa corridor, then pick up the Harry Reid UPRR Trail — a 13-mile rail trail that crosses I-11 on dedicated bridges and delivers you to the River Mountains Loop Trail.",
    trails: [
      "Amargosa Trail return (~2 mi, mixed)",
      "Amargosa to UPRR connector (~3 mi, paved)",
      "Harry Reid UPRR Trail (~8 mi, paved)",
    ],
  },
  {
    label: "Phase 7",
    title: "River Mountains & Bootleg Canyon",
    miles: "~20–28",
    surface: "Paved path + dirt singletrack",
    description:
      "The RMLT climbs through the River Mountains toward Boulder City. Detour into Bootleg Canyon for 36+ miles of desert singletrack — IMBA, Girl Scout, Caldera, POW. Select loops to dial in your target distance, then rejoin the RMLT into Boulder City.",
    trails: [
      "RMLT south toward Boulder City (~5–7 mi, paved)",
      "Bootleg Canyon singletrack loops (~12–16 mi, dirt)",
      "RMLT Boulder City segment (~3–5 mi, paved)",
    ],
  },
  {
    label: "Phase 8",
    title: "Historic Railroad Trail — Finish",
    miles: "~4",
    surface: "Hardpacked gravel",
    description:
      "Five tunnels carved a century ago for the Hoover Dam railroad. Cool concrete, desert light at each portal, and the dam itself rising ahead. Cross the line in Boulder City.",
    trails: ["Historic Railroad Trail (~4 mi, gravel)"],
  },
];

export const courseStory: {
  label: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}[] = [
  {
    label: "Start",
    title: "Red Rock Sandstone",
    description:
      "Begin among the Calico Hills and Keystone Thrust — ancient seabed turned vertical, glowing amber at first light.",
    image: "/basin-and-range/images/hero-red-rock.jpg",
    imageAlt: "Red sandstone formations at Red Rock Canyon",
  },
  {
    label: "Miles 8–30",
    title: "Blue Diamond Hill & The Crossing",
    description:
      "Loop through fifty miles of desert singletrack on Blue Diamond Hill, then cross the basin floor east toward Henderson — the one road section before the trails pick up again.",
    image: "/basin-and-range/images/blue-diamond-hill.jpg",
    imageAlt: "Joshua tree with Red Rock Canyon peaks in the background",
  },
  {
    label: "Miles 30–50",
    title: "Henderson Corridor",
    description:
      "Paved multi-use paths thread through Henderson — the St. Rose Parkway Trail, Amargosa Trail, and the dirt climb into the McCullough foothills.",
    image: "/basin-and-range/images/mccullough-basin.jpg",
    imageAlt: "Desert basin and volcanic ridgeline in Southern Nevada",
  },
  {
    label: "Miles 50–70",
    title: "McCullough Hills & Volcanic Ridges",
    description:
      "The heart of the race. Exposed volcanic singletrack through Sloan Canyon NCA, the McCullough Range ridgeline, and the Anthem East traverse. Dark rock, long views, and serious desert running.",
    image: "/basin-and-range/images/boulder-desert.jpg",
    imageAlt: "Aerial view of desert ridgelines in Southern Nevada",
  },
  {
    label: "Miles 70–90",
    title: "River Mountains & Bootleg Canyon",
    description:
      "The RMLT climbs into the River Mountains, then Bootleg Canyon delivers miles of desert singletrack with views of Lake Mead before the route drops into Boulder City.",
    image: "/basin-and-range/images/lake-mead.jpg",
    imageAlt: "Aerial view of Lake Mead and surrounding desert terrain",
  },
  {
    label: "Miles 90–100+",
    title: "Historic Railroad Trail — Finish",
    description:
      "Enter the tunnels. Five portals of cool concrete and desert light, the dam rising ahead, and a finish in a town with real history and real character.",
    image: "/basin-and-range/images/railroad-tunnel-nps.jpg",
    imageAlt: "Looking through a Historic Railroad Trail tunnel toward the next portal",
  },
];

export const surfaceBreakdown = [
  { label: "Dirt Singletrack", value: "~65–70 mi", percent: 63 },
  { label: "Paved Multi-Use Path", value: "~32–35 mi", percent: 31 },
  { label: "Road", value: "~10–12 mi", percent: 10 },
  { label: "Hardpacked Gravel", value: "~4 mi", percent: 4 },
];
