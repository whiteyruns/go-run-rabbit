/**
 * Static SVG route map — plots the confirmed Basin & Range waypoints
 * on a scaled coordinate system with phase coloring.
 * No external dependencies. Works as a server component.
 */

// Coordinate bounds (from waypoint GPX)
const LAT_MIN = 35.94;
const LAT_MAX = 36.17;
const LON_MIN = -115.52;
const LON_MAX = -114.73;

const SVG_W = 1200;
const SVG_H = 600;
const PAD = 60;

function project(lat: number, lon: number): [number, number] {
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (SVG_W - PAD * 2);
  // Flip Y — higher lat = higher on screen
  const y =
    PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (SVG_H - PAD * 2);
  return [x, y];
}

interface Waypoint {
  lat: number;
  lon: number;
  label?: string;
  phase: number;
}

const waypoints: Waypoint[] = [
  // Phase 1: Red Rock
  { lat: 36.1316, lon: -115.427, label: "START\nRed Rock", phase: 1 },
  { lat: 36.1545, lon: -115.4958, phase: 1 },
  { lat: 36.163, lon: -115.485, phase: 1 },
  { lat: 36.149, lon: -115.472, phase: 1 },
  { lat: 36.141, lon: -115.46, phase: 1 },
  { lat: 36.1545, lon: -115.4958, phase: 1 },
  { lat: 36.0938, lon: -115.427, phase: 1 },
  // Phase 2: Blue Diamond Hill
  { lat: 36.056, lon: -115.405, label: "Blue Diamond\nHill", phase: 2 },
  { lat: 36.042, lon: -115.385, phase: 2 },
  // Phase 3: Road gap
  { lat: 36.025, lon: -115.34, phase: 3 },
  { lat: 36.0125, lon: -115.172, phase: 3 },
  { lat: 36.001, lon: -115.15, label: "Henderson", phase: 3 },
  // Phase 4: Henderson trails
  { lat: 35.9975, lon: -115.13, phase: 4 },
  { lat: 35.992, lon: -115.087, phase: 4 },
  { lat: 35.985, lon: -115.055, phase: 4 },
  { lat: 35.97, lon: -115.02, phase: 4 },
  { lat: 35.963, lon: -115.007, phase: 4 },
  // Phase 5: McCullough Hills
  { lat: 35.978, lon: -115.05, label: "McCullough\nHills", phase: 5 },
  { lat: 35.993, lon: -115.08, phase: 5 },
  { lat: 35.9755, lon: -115.066, phase: 5 },
  // Phase 6: Return to RMLT
  { lat: 35.99, lon: -115.04, phase: 6 },
  { lat: 36.005, lon: -114.98, phase: 6 },
  { lat: 35.991, lon: -114.938, phase: 6 },
  // Phase 7: RMLT + Bootleg
  { lat: 35.989, lon: -114.928, phase: 7 },
  { lat: 35.984, lon: -114.863, label: "Bootleg\nCanyon", phase: 7 },
  { lat: 35.97, lon: -114.855, phase: 7 },
  { lat: 35.981, lon: -114.84, phase: 7 },
  // Phase 8: Historic Railroad + Finish
  { lat: 36.01, lon: -114.825, label: "Railroad\nTrail", phase: 8 },
  { lat: 36.015, lon: -114.78, phase: 8 },
  { lat: 36.017, lon: -114.75, phase: 8 },
  { lat: 35.979, lon: -114.832, label: "FINISH\nBoulder City", phase: 8 },
];

const phaseColors: Record<number, string> = {
  1: "#e5c276", // primary gold — Red Rock
  2: "#d5c5a9", // secondary — Blue Diamond
  3: "#999080", // outline — road gap
  4: "#d0c5b4", // on-surface-variant — Henderson paved
  5: "#e5c276", // primary gold — McCullough
  6: "#d0c5b4", // on-surface-variant — Henderson return
  7: "#e5c276", // primary gold — Bootleg
  8: "#d3c4b2", // tertiary — Railroad Trail
};

const phaseLabels: Record<number, string> = {
  1: "Red Rock NCA",
  2: "Blue Diamond Hill",
  3: "Road Gap",
  4: "Henderson Trails",
  5: "McCullough Hills",
  6: "UPRR Trail",
  7: "RMLT + Bootleg",
  8: "Railroad Trail",
};

export default function RouteMapSVG() {
  // Group waypoints into phase segments for polylines
  const segments: { phase: number; points: [number, number][] }[] = [];
  let currentPhase = waypoints[0].phase;
  let currentPoints: [number, number][] = [];

  for (const wp of waypoints) {
    if (wp.phase !== currentPhase) {
      segments.push({ phase: currentPhase, points: [...currentPoints] });
      // Start new segment with last point of previous for continuity
      currentPoints = [currentPoints[currentPoints.length - 1]];
      currentPhase = wp.phase;
    }
    currentPoints.push(project(wp.lat, wp.lon));
  }
  segments.push({ phase: currentPhase, points: currentPoints });

  // Labeled waypoints only
  const labeled = waypoints.filter((w) => w.label);

  return (
    <div className="w-full overflow-hidden bg-[#12110f]">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Basin & Range 100 route map showing 8 phases from Red Rock Canyon to Boulder City"
      >
        {/* Background texture — subtle topo-like lines */}
        <defs>
          <pattern
            id="topo"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,40 Q20,30 40,40 T80,40"
              fill="none"
              stroke="#252219"
              strokeWidth="0.5"
            />
            <path
              d="M0,60 Q20,50 40,55 T80,60"
              fill="none"
              stroke="#252219"
              strokeWidth="0.3"
            />
            <path
              d="M0,20 Q25,15 50,20 T80,18"
              fill="none"
              stroke="#252219"
              strokeWidth="0.3"
            />
          </pattern>

          {/* Glow filter for route line */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle shadow for labels */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>

        <rect width={SVG_W} height={SVG_H} fill="#12110f" />
        <rect width={SVG_W} height={SVG_H} fill="url(#topo)" />

        {/* Terrain suggestion — mountain silhouettes */}
        <path
          d="M0,350 Q80,280 160,310 T320,260 T480,290 T640,250 T800,280 T960,260 T1100,290 L1200,310 L1200,600 L0,600Z"
          fill="#1a1815"
          opacity="0.5"
        />
        <path
          d="M0,400 Q100,360 200,380 T400,350 T600,370 T800,340 T1000,370 L1200,360 L1200,600 L0,600Z"
          fill="#1a1815"
          opacity="0.3"
        />

        {/* Route segments by phase */}
        {segments.map((seg, i) => (
          <polyline
            key={i}
            points={seg.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={phaseColors[seg.phase]}
            strokeWidth={seg.phase === 3 ? 2 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={seg.phase === 3 ? "8,6" : "none"}
            opacity={seg.phase === 3 ? 0.5 : 0.85}
            filter="url(#glow)"
          />
        ))}

        {/* Phase transition dots */}
        {segments.map((seg, i) => {
          if (i === 0) return null;
          const [x, y] = seg.points[0];
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={3}
              fill={phaseColors[seg.phase]}
              opacity={0.6}
            />
          );
        })}

        {/* Start marker */}
        {(() => {
          const [x, y] = project(waypoints[0].lat, waypoints[0].lon);
          return (
            <g>
              <circle cx={x} cy={y} r={8} fill="#e5c276" opacity={0.3} />
              <circle cx={x} cy={y} r={5} fill="#e5c276" />
              <circle cx={x} cy={y} r={2} fill="#12110f" />
            </g>
          );
        })()}

        {/* Finish marker */}
        {(() => {
          const last = waypoints[waypoints.length - 1];
          const [x, y] = project(last.lat, last.lon);
          return (
            <g>
              <circle cx={x} cy={y} r={8} fill="#d3c4b2" opacity={0.3} />
              <circle cx={x} cy={y} r={5} fill="#d3c4b2" />
              <circle cx={x} cy={y} r={2} fill="#12110f" />
            </g>
          );
        })()}

        {/* Labels */}
        {labeled.map((wp, i) => {
          const [x, y] = project(wp.lat, wp.lon);
          const lines = wp.label!.split("\n");
          const isFinish = wp.label!.includes("FINISH");
          const isStart = wp.label!.includes("START");

          // Offset labels to avoid overlapping the route
          const offsetX = isFinish ? -8 : isStart ? -8 : 10;
          const offsetY = isFinish ? 18 : isStart ? -14 : -8;

          return (
            <g key={`label-${i}`} filter="url(#shadow)">
              {lines.map((line, j) => (
                <text
                  key={j}
                  x={x + offsetX}
                  y={y + offsetY + j * 13}
                  fill={isStart || isFinish ? "#e5c276" : "#999080"}
                  fontSize={isStart || isFinish ? 11 : 9}
                  fontFamily="system-ui, sans-serif"
                  fontWeight={isStart || isFinish ? 600 : 400}
                  textAnchor={isFinish || isStart ? "end" : "start"}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Legend */}
        {[1, 3, 5, 7, 8].map((phase, i) => (
          <g key={`legend-${phase}`} transform={`translate(${PAD + i * 210}, ${SVG_H - 25})`}>
            <line
              x1={0}
              y1={0}
              x2={20}
              y2={0}
              stroke={phaseColors[phase]}
              strokeWidth={phase === 3 ? 2 : 3}
              strokeDasharray={phase === 3 ? "4,3" : "none"}
              opacity={phase === 3 ? 0.5 : 0.85}
            />
            <text
              x={26}
              y={4}
              fill="#4d4639"
              fontSize={9}
              fontFamily="system-ui, sans-serif"
            >
              {phaseLabels[phase]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
