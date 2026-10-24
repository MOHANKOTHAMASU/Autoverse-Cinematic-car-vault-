import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Info,
} from 'lucide-react';

export type CrashScenario =
  | 'frontal'
  | 'side'
  | 'rollover'
  | 'restraints'
  | 'crumple'
  | 'battery'
  | 'aeb';

interface ScenarioMeta {
  id: CrashScenario;
  title: string;
  badge: string;
  speed: string;
  description: string;
  keyEvents: { timeMs: number; label: string; detail: string }[];
  forceSummary: { peakG: string; absorbedKJ: string; structuralDef: string };
  officialReference?: string;
}

const SCENARIOS: Record<CrashScenario, ScenarioMeta> = {
  frontal: {
    id: 'frontal',
    title: 'Frontal 40% Offset Deformable Barrier',
    badge: '64 KM/H · EURO NCAP / BHARAT NCAP TEST PROTOCOL',
    speed: '64 km/h (40 mph)',
    description:
      'Tests vehicle frontal energy absorption when 40% of the front width impacts an aluminum honeycomb deformable barrier, simulating a severe head-on offset collision.',
    keyEvents: [
      { timeMs: 0, label: 'Initial Impact Contact', detail: 'Front bumper meets honeycomb barrier at 64 km/h.' },
      { timeMs: 15, label: 'Sensor Trigger & Pretensioners', detail: 'Accelerometers detect >8G deceleration. Seatbelt pyrotechnic tensioners take up slack.' },
      { timeMs: 30, label: 'Dual-Stage Airbag Inflation', detail: 'Driver & passenger steering/dash airbags reach full inflation volume before occupant contact.' },
      { timeMs: 55, label: 'Peak Crumple Energy Dissipation', detail: 'Boron steel longitudinal crash members compress progressively, protecting the passenger cabin.' },
      { timeMs: 85, label: 'Controlled Occupant Rebound', detail: 'Seatbelt load-limiters pay out controlled webbing to limit peak thoracic chest compression.' },
      { timeMs: 120, label: 'Vehicle Rest & Post-Impact Isolation', detail: 'Kinetic energy fully dissipated. Hazard flashers trigger and autonomous eCall initiates.' },
    ],
    forceSummary: { peakG: '28.5 G', absorbedKJ: '215 kJ', structuralDef: '480 mm' },
    officialReference: 'Euro NCAP 2024 / Bharat NCAP MPV/SUV Protocol',
  },
  side: {
    id: 'side',
    title: 'Side Mobile Deformable Barrier & Pole Impact',
    badge: '50 KM/H · LATERAL OCCUPANT INTRUSION TEST',
    speed: '50 km/h (31 mph) / 32 km/h Pole',
    description:
      'Evaluates side structure stiffness, B-pillar reinforcement, and side curtain/pelvis airbag coverage during severe T-bone and rigid pole lateral strikes.',
    keyEvents: [
      { timeMs: 0, label: 'Side Barrier Impact', detail: 'Mobile deformable barrier strikes vehicle at driver B-pillar center.' },
      { timeMs: 8, label: 'Lateral Sensor Trigger', detail: 'Door pressure sensors and B-pillar accelerometers register lateral intrusion pulse.' },
      { timeMs: 18, label: 'Curtain & Thorax Airbag Deployment', detail: 'Full-length window curtain airbags drop down to seal window aperture.' },
      { timeMs: 40, label: 'B-Pillar Load Transfer', detail: 'Ultra-high-strength steel B-pillar and roof cross-member divert energy into sill and floor.' },
      { timeMs: 70, label: 'Peak Lateral Intrusion', detail: 'Door intrusion arrested outside critical survival space.' },
      { timeMs: 120, label: 'Kinetic Dissipation', detail: 'Occupants cushioned against head and lateral pelvic strike.' },
    ],
    forceSummary: { peakG: '22.0 G', absorbedKJ: '145 kJ', structuralDef: '260 mm' },
    officialReference: 'UN R95 & Euro NCAP Lateral Protection Protocol',
  },
  rollover: {
    id: 'rollover',
    title: 'Dynamic Rollover & Roof Crush Integrity',
    badge: 'FMVSS 216A / IIHS ROOF STRENGTH COMPLIANCE',
    speed: 'Sustained Static / Dynamic Test',
    description:
      'Demonstrates rigid A- and B-pillar roof strength maintaining occupant survival envelope when sustaining over 4.5 times vehicle curb weight.',
    keyEvents: [
      { timeMs: 0, label: 'Vehicle Tripping Event', detail: 'Simulated high-lateral tripping moment initiates vehicle tilt.' },
      { timeMs: 20, label: 'ESC & Roll-Rate Gyro Trigger', detail: 'Inertial measurement unit registers abnormal roll rate angular velocity.' },
      { timeMs: 35, label: 'Side Curtain Airbag Pre-Inflation', detail: 'Rollover-sensing curtain airbags inflate and remain pressurized for 6 full seconds.' },
      { timeMs: 60, label: 'Roof Plate Structural Loading', detail: 'Hydroformed boron steel roof bows absorb downward force without cabin intrusion.' },
      { timeMs: 90, label: 'Survival Cell Preservation', detail: 'Headroom clearance remains preserved for all seating positions.' },
      { timeMs: 120, label: 'Inversion Stabilization', detail: 'EV battery low center-of-gravity naturally resists excessive roll continuation.' },
    ],
    forceSummary: { peakG: '16.8 G', absorbedKJ: '180 kJ', structuralDef: '65 mm (Roof Crush)' },
    officialReference: 'FMVSS 216a Roof Crush Standard (4.5x Curb Weight)',
  },
  restraints: {
    id: 'restraints',
    title: 'Pyrotechnic Restraints & Intelligent Airbags',
    badge: 'OCCUPANT BIOMECHANICS & KINEMATICS',
    speed: 'Active Deployment Protocol',
    description:
      'Detailed visualization of the restraint sequence: seatbelt pretensioning, load-limiter force shedding, and dual-stage gas generator deployment.',
    keyEvents: [
      { timeMs: 0, label: 'Impact Detection', detail: 'Dual front crash sensors verify impact severity threshold exceeded.' },
      { timeMs: 12, label: 'Pretensioner Activation', detail: 'Pyrotechnic micro-gas generators retract seatbelt webbing by 100mm in 10ms.' },
      { timeMs: 25, label: 'First-Stage Airbag Burn', detail: 'Airbag inflates smoothly to cushion early torso motion without harsh rebound.' },
      { timeMs: 45, label: 'Adaptive Load Limiting', detail: 'Torsion bar in retractor yields to prevent ribcage/sternum peak load injury.' },
      { timeMs: 70, label: 'Controlled Venting', detail: 'Airbag rear exhaust vents release gas as occupant sinks into cushion.' },
      { timeMs: 120, label: 'Secondary Impact Safeguard', detail: 'Occupants kept securely positioned away from vehicle steering column.' },
    ],
    forceSummary: { peakG: '24.2 G', absorbedKJ: '165 kJ', structuralDef: 'Chest G: <42G' },
    officialReference: 'ECE R16 / Euro NCAP Biomechanical Safety Benchmarks',
  },
  crumple: {
    id: 'crumple',
    title: 'Progressive High-Strength Crumple Zone Deformation',
    badge: 'STRUCTURAL LOAD PATH ENGINEERING',
    speed: '64 km/h Impact Kinematics',
    description:
      'Visualizes how tailored longitudinal aluminum and boron crash rails fold like an accordion, converting kinetic momentum into controlled plastic deformation.',
    keyEvents: [
      { timeMs: 0, label: 'Bumper Beam Strike', detail: 'Crossmember distributes impact load across left and right longitudinal rails.' },
      { timeMs: 20, label: 'Crash Box Accordion Folding', detail: 'First crush zones deform at calculated crease points.' },
      { timeMs: 45, label: 'Multi-Path Load Divergence', detail: 'Loads split into upper shotgun rails, side sills, and tunnel reinforcement.' },
      { timeMs: 75, label: 'Subframe Shearing & Engine/Motor Drop', detail: 'Drive unit mounts shear cleanly downward away from cabin floor.' },
      { timeMs: 100, label: 'Passenger Safety Cage Rigid Lock', detail: 'A-pillar, fire wall, and floor pan exhibit zero structural compromise.' },
      { timeMs: 120, label: 'Energy Attenuation Complete', detail: 'Kinetic energy managed without cabin passenger compromise.' },
    ],
    forceSummary: { peakG: '29.1 G', absorbedKJ: '230 kJ', structuralDef: '520 mm Compression' },
    officialReference: 'Automotive Boron Steel Crash Metallurgy Standards',
  },
  battery: {
    id: 'battery',
    title: 'EV 800V High-Voltage Battery Isolation & Pyrofuse',
    badge: 'HIGH-VOLTAGE DIELECTRIC SAFETY · UN ECE R100',
    speed: 'Instantaneous Collision Protocol',
    description:
      'Demonstrates the millisecond pyrotechnic fuse severance of the high-voltage bus, isolating the 800V DC battery pack from the chassis within 30 milliseconds.',
    keyEvents: [
      { timeMs: 0, label: 'Crash Pulse Inception', detail: 'High-G crash pulse detected by front/side inertial sensors.' },
      { timeMs: 14, label: 'Battery Management Signal', detail: 'BMS receives direct emergency hardwire cutoff command.' },
      { timeMs: 22, label: 'Pyrofuse Detonation', detail: 'Controlled explosive charge severs high-voltage copper busbar physically.' },
      { timeMs: 32, label: 'Bus Discharge to <60V DC', detail: 'Inverter capacitors bleed down below dangerous voltage threshold in <35ms.' },
      { timeMs: 65, label: 'Underbody Armored Shield Integrity', detail: 'Titanium/aluminum skid plate protects cells from debris penetration.' },
      { timeMs: 120, label: 'Zero Dielectric Leakage', detail: 'Safe for first-responder extraction with zero post-collision high-voltage hazard.' },
    ],
    forceSummary: { peakG: '28.0 G', absorbedKJ: '205 kJ', structuralDef: 'Cell Box Def: 0.0 mm' },
    officialReference: 'UN ECE Regulation 100 / ISO 6469-3 EV Safety',
  },
  aeb: {
    id: 'aeb',
    title: 'Active Crash Avoidance (Autonomous Emergency Braking)',
    badge: 'ACTIVE SAFETY & ADAS CRASH PREVENTION',
    speed: '60 km/h to 0 km/h Deceleration',
    description:
      'Highlights the difference between crash avoidance and crash protection. Demonstrates radar, camera, and LiDAR fusion identifying obstacles and braking autonomously.',
    keyEvents: [
      { timeMs: 0, label: 'Obstacle Detection', detail: 'Forward radar and stereo cameras register stationary obstacle ahead.' },
      { timeMs: 30, label: 'Driver Warning Tone & HUD Flash', detail: 'Acoustic alert and heads-up display warning trigger for driver.' },
      { timeMs: 60, label: 'Brake Hydraulic Pre-Charge', detail: 'Brake pads lightly graze carbon ceramic discs to eliminate clearance.' },
      { timeMs: 85, label: 'Autonomous Maximum Deceleration', detail: 'Active electronic braking commands 1.1G deceleration without driver foot pressure.' },
      { timeMs: 110, label: 'Pre-Safe Tensioning', detail: 'Seatbelts pull occupants back; side windows close to prepare for possible impact.' },
      { timeMs: 120, label: 'Full Stop Without Impact', detail: 'Vehicle stops 1.8 meters before obstacle. Zero collision damage sustained.' },
    ],
    forceSummary: { peakG: '-1.1 G (Braking)', absorbedKJ: 'N/A (Avoided)', structuralDef: '0 mm (Impact Prevented)' },
    officialReference: 'Euro NCAP AEB Car-to-Car / VRU Test Protocol',
  },
};

export const SafetyLabVisualization: React.FC<{ vehicleName?: string }> = ({
  vehicleName = 'Porsche Taycan Turbo S',
}) => {
  const [scenario, setScenario] = useState<CrashScenario>('frontal');
  const [timeMs, setTimeMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5); // 0.25x, 0.5x, 1x

  const activeMeta = SCENARIOS[scenario];

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 40; // update interval
    const stepIncrement = Math.round(5 * playbackSpeed);

    const timer = setInterval(() => {
      setTimeMs((prev) => {
        if (prev >= 120) {
          setIsPlaying(false);
          return 120;
        }
        return Math.min(120, prev + stepIncrement);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setTimeMs(0);
  };

  const currentEvent = [...activeMeta.keyEvents]
    .reverse()
    .find((e) => timeMs >= e.timeMs) || activeMeta.keyEvents[0];

  // Calculate visual positions based on timeMs (0 -> 120)
  const progressRatio = timeMs / 120;

  // Front barrier impact progress (starts contact around 30% time)
  const impactProgress = Math.max(0, Math.min(1, (timeMs - 15) / 60));
  const carX = scenario === 'aeb'
    ? 80 + (1 - Math.pow(1 - progressRatio, 2)) * 260
    : 70 + Math.min(progressRatio * 200, 150);

  const barrierDef = scenario === 'aeb' ? 0 : Math.round(impactProgress * 28);
  const crumpleDef = scenario === 'aeb' ? 0 : Math.round(impactProgress * 36);
  const airbagOpacity = scenario === 'aeb'
    ? 0
    : timeMs >= 30 && timeMs <= 100
    ? Math.min(1, (timeMs - 25) / 15)
    : timeMs > 100
    ? Math.max(0.2, 1 - (timeMs - 100) / 20)
    : 0;

  const batteryVoltage = scenario === 'battery'
    ? timeMs < 22
      ? 800
      : Math.max(12, Math.round(800 * Math.exp(-(timeMs - 22) / 6)))
    : 800;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & MANDATORY SIMULATION DISCLAIMER BADGE */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: 'var(--accent-red)',
              }}
            >
              INSIDE THE IMPACT · SAFETY LAB
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
              }}
            >
              Illustrative simulation — not a certified crash test
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            {vehicleName} Impact Kinematics & Structural Dynamics
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Visual educational demonstration evaluating load dissipation, high-voltage battery isolation, and occupant survival cells.
          </p>
        </div>

        {/* Certified Reference Citation */}
        <div
          style={{
            backgroundColor: 'rgba(15, 20, 28, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Benchmark Reference
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {activeMeta.officialReference || 'Euro NCAP 5-Star Test Protocol'}
          </div>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {(Object.keys(SCENARIOS) as CrashScenario[]).map((key) => {
          const s = SCENARIOS[key];
          const isSelected = scenario === key;
          return (
            <button
              key={key}
              onClick={() => {
                setScenario(key);
                handleReset();
              }}
              style={{
                padding: '0.55rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#07090d' : '#ffffff',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Simulation Canvas / Vector Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          backgroundColor: '#05080e',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Metric Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        {/* Track / Laboratory Floor Marking */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '2rem',
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          CRASH LABORATORY TRACK · IMPACT LINE: X=450MM · TIME RESOLUTION: 1.0 MS
        </div>

        {/* Live Millisecond & G-Force Stamp */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.7rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Impact Elapsed
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              +{timeMs} ms
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.7rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Chassis G-Pulse
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f87171', fontFamily: 'monospace' }}>
              {timeMs < 15 ? '0.0 G' : activeMeta.forceSummary.peakG}
            </div>
          </div>

          {scenario === 'battery' && (
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                border: `1px solid ${batteryVoltage < 60 ? '#10b981' : '#f59e0b'}`,
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                DC Bus Voltage
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  color: batteryVoltage < 60 ? '#10b981' : '#fbbf24',
                  fontFamily: 'monospace',
                }}
              >
                {batteryVoltage} V
              </div>
            </div>
          )}
        </div>

        {/* Dynamic SVG Vehicle & Barrier Simulation */}
        <svg
          viewBox="0 0 800 320"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="cabinGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="barrierGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Test Barrier or Target Obstacle */}
          {scenario !== 'aeb' ? (
            <g transform={`translate(${520 - barrierDef}, 120)`}>
              {/* Aluminum Honeycomb Crush Face */}
              <rect
                x="0"
                y="0"
                width={70 - barrierDef * 0.6}
                height="150"
                fill="url(#barrierGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
                rx="3"
              />
              <text
                x="15"
                y="80"
                fill="#000000"
                fontSize="10"
                fontWeight="800"
                transform="rotate(90, 15, 80)"
                letterSpacing="1"
              >
                BARRIER 40%
              </text>
              {/* Rigid Support Wall behind barrier */}
              <rect x="70" y="-10" width="30" height="170" fill="#334155" stroke="#64748b" />
            </g>
          ) : (
            <g transform="translate(620, 130)">
              {/* Stationary Target Vehicle Profile */}
              <rect x="0" y="30" width="80" height="110" fill="#475569" stroke="#94a3b8" rx="8" />
              <text x="10" y="85" fill="#ffffff" fontSize="10" fontWeight="bold">
                STOPPED CAR
              </text>
            </g>
          )}

          {/* AEB Radar / Sensor Cone */}
          {scenario === 'aeb' && (
            <polygon
              points={`${carX + 240},200 ${carX + 440},130 ${carX + 440},270`}
              fill="rgba(6, 182, 212, 0.15)"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeDasharray="4 4"
            />
          )}

          {/* Dynamic Moving Vehicle Assembly */}
          <g transform={`translate(${carX}, 130)`}>
            {/* Front Longitudinal Crumple Zone (folds/compresses upon impact) */}
            <path
              d={`M 170 120 L ${240 - crumpleDef} 120 L ${250 - crumpleDef} 80 L ${210 - crumpleDef * 0.4} 60 L 170 60 Z`}
              fill={impactProgress > 0 ? '#ef4444' : '#64748b'}
              stroke="#ffffff"
              strokeWidth="2"
              filter={impactProgress > 0 ? 'url(#glow)' : undefined}
            />

            {/* Rigid Passenger Safety Cage (Boron Steel Survival Cell) */}
            <path
              d="M 50 120 L 170 120 L 170 60 L 140 10 L 50 10 L 20 60 L 0 60 L 0 120 Z"
              fill="url(#cabinGrad)"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />

            {/* Windows / Canopy */}
            <path
              d="M 55 55 L 135 55 L 115 20 L 60 20 Z"
              fill="rgba(255, 255, 255, 0.15)"
              stroke="rgba(255, 255, 255, 0.4)"
            />

            {/* EV High-Voltage Underbody Battery Pack */}
            <rect
              x="30"
              y="115"
              width="135"
              height="18"
              fill={batteryVoltage < 60 ? '#10b981' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth="1.5"
              rx="4"
            />
            <text x="42" y="128" fill="#000000" fontSize="8" fontWeight="bold">
              {batteryVoltage < 60 ? '800V PYROFUSE CUT · SAFE' : '800V ENERGIZED PACK'}
            </text>

            {/* Occupant Restraint Dummy Silhouette */}
            <circle cx="85" cy="45" r="9" fill="#f8fafc" />
            <path d="M 85 54 L 85 90 L 105 105" stroke="#f8fafc" strokeWidth="4" fill="none" />

            {/* Steering Wheel */}
            <circle cx="120" cy="65" r="8" fill="none" stroke="#94a3b8" strokeWidth="2.5" />

            {/* Inflating Airbag Graphic */}
            {airbagOpacity > 0 && (
              <ellipse
                cx="110"
                cy="60"
                rx={18 * airbagOpacity}
                ry={18 * airbagOpacity}
                fill="rgba(255, 255, 255, 0.9)"
                stroke="#f59e0b"
                strokeWidth="2"
                opacity={airbagOpacity}
              />
            )}

            {/* Side Curtain Airbag */}
            {(scenario === 'side' || scenario === 'rollover') && timeMs >= 18 && (
              <rect
                x="45"
                y="15"
                width="100"
                height="45"
                fill="rgba(255, 255, 255, 0.85)"
                stroke="#06b6d4"
                strokeWidth="2"
                rx="4"
              />
            )}

            {/* Wheels */}
            <circle cx="45" cy="135" r="18" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
            <circle cx="45" cy="135" r="8" fill="#0f172a" />
            <circle cx="195" cy="135" r="18" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
            <circle cx="195" cy="135" r="8" fill="#0f172a" />
          </g>

          {/* Impact Force Vectors when colliding */}
          {impactProgress > 0 && (
            <g transform={`translate(${carX + 240 - crumpleDef}, 170)`}>
              <line x1="0" y1="0" x2="-35" y2="0" stroke="#f87171" strokeWidth="4" markerEnd="url(#arrow)" />
              <line x1="0" y1="-20" x2="-30" y2="-20" stroke="#f87171" strokeWidth="3" />
              <line x1="0" y1="20" x2="-30" y2="20" stroke="#f87171" strokeWidth="3" />
              <text x="-80" y="-30" fill="#f87171" fontSize="11" fontWeight="800">
                CRUSH LOAD: {activeMeta.forceSummary.peakG}
              </text>
            </g>
          )}
        </svg>

        {/* Real-time State Banner inside Visualizer */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '1.5rem',
            backgroundColor: 'rgba(10, 14, 22, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.78rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Activity size={14} color="var(--accent-cyan)" />
          <span>
            <strong>T={timeMs}ms:</strong> {currentEvent.label}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Scrubbing Timeline Bar */}
      <div
        style={{
          backgroundColor: 'rgba(10, 14, 22, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Play/Pause & Speed Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '0.55rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Kinematic Test'}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn btn-secondary"
              title="Reset Timeline to 0ms"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.9rem' }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: '0.3rem' }}>
              Time Multiplier:
            </span>
            {[0.25, 0.5, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackSpeed(rate)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor:
                    playbackSpeed === rate ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${playbackSpeed === rate ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  color: playbackSpeed === rate ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {rate}x {rate === 0.25 ? 'Slow' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Scrubbable Range Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>0 ms (Contact Initiation)</span>
            <span>30 ms (Airbag Inception)</span>
            <span>60 ms (Peak Crumple)</span>
            <span>90 ms (Rebound)</span>
            <span>120 ms (Full Arrest)</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            value={timeMs}
            onChange={(e) => {
              setIsPlaying(false);
              setTimeMs(Number(e.target.value));
            }}
            style={{
              width: '100%',
              accentColor: 'var(--accent-cyan)',
              cursor: 'ew-resize',
            }}
          />
        </div>
      </div>

      {/* Physics Event Breakdown & Force Telemetry Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Active Phase Explanation */}
        <div
          style={{
            backgroundColor: 'rgba(15, 20, 28, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.35rem' }}>
            ACTIVE EVENT BREAKDOWN (T={currentEvent.timeMs}ms)
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
            {currentEvent.label}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
            {currentEvent.detail}
          </p>
        </div>

        {/* Dynamic Force & Telemetry Dashboard */}
        <div
          style={{
            backgroundColor: 'rgba(15, 20, 28, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Peak Deceleration
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>
              {activeMeta.forceSummary.peakG}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Energy Dissipated
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {activeMeta.forceSummary.absorbedKJ}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Zone Compression
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
              {activeMeta.forceSummary.structuralDef}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Cabin Integrity
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
              100% Intact
            </div>
          </div>
        </div>
      </div>

      {/* Critical Educational Safety Distinction */}
      <div
        style={{
          marginTop: '1.5rem',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <Info size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#ffffff' }}>Crash Avoidance vs. Crash Protection:</strong> Active safety technologies (such as Forward Collision Warning and Autonomous Emergency Braking) work proactively to prevent a collision before impact. Passive safety elements (including ultra-high-strength boron steel survival cages, progressive crumple zones, 800V pyrofuse disconnects, and multi-stage airbags) manage deceleration energy to protect occupants if an impact becomes unavoidable. Real-world collision outcomes depend heavily on speed, restraint usage, vehicle masses, impact angles, and environmental variables.
        </div>
      </div>
    </div>
  );
};
