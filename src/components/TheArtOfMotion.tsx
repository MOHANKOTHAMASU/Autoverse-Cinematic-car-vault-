import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Activity,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isCarInGarage, toggleCarInGarage } from '../utils/garage';
import type { CinemaFilm } from '../data/cinemaVideos';

interface SceneData {
  id: number;
  chapter: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accentColor: string;
  telemetry: {
    label: string;
    value: string;
    unit?: string;
  }[];
  engineeringNotes: string;
  audioSignature: string;
}

const MOTION_SCENES: SceneData[] = [
  {
    id: 1,
    chapter: 'ACT I // 01',
    title: 'The Emergence',
    subtitle: 'From Absolute Void Into Form',
    description:
      'A predatory silhouette cuts through cryogenic darkness. Zero ambient sound — only the low-frequency acoustic hum of dual permanently excited synchronous motors waiting for current.',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#00f0ff',
    telemetry: [
      { label: 'Ambient Temp', value: '-4', unit: '°C' },
      { label: 'Standby Draw', value: '12', unit: 'W' },
      { label: 'Chassis Status', value: 'Primed' },
    ],
    engineeringNotes: 'Cryogenic testing at the Porsche Arctic Proving Grounds, Arjeplog, Sweden.',
    audioSignature: '800V Silicon Carbide Inverter Frequency: 16 kHz Hum',
  },
  {
    id: 2,
    chapter: 'ACT II // 02',
    title: 'Face of Velocity',
    subtitle: 'HD Matrix LED Illumination & Active Aerodynamics',
    description:
      'Four-point HD Matrix LED projectors awaken with 32,000 individually controlled pixels. Active aerodynamic cooling air curtains open automatically to feed front axle brake heat sinks.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#38bdf8',
    telemetry: [
      { label: 'Matrix Pixels', value: '32,768', unit: 'px' },
      { label: 'Aero Drag (Cd)', value: '0.22', unit: 'Cd' },
      { label: 'Throw Distance', value: '600', unit: 'm' },
    ],
    engineeringNotes: 'Micro-LED pixel arrays with real-time non-glare camera mask projection.',
    audioSignature: 'Pneumatic Active Air Flap Actuator Cycle (0.35s)',
  },
  {
    id: 3,
    chapter: 'ACT III // 03',
    title: 'Sculpted Silhouette & Forged Rotors',
    subtitle: 'Carbon Ceramic Composite Deceleration',
    description:
      'Flow lines carved in the wind tunnel taper into muscular rear haunches. 21-inch Mission E aero-bladed forged wheels frame massive 10-piston Acid Yellow calipers clamping 420mm discs.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#eab308',
    telemetry: [
      { label: 'Front Caliper', value: '10', unit: 'Piston' },
      { label: 'Disc Diameter', value: '420', unit: 'mm' },
      { label: 'Thermal Peak', value: '850', unit: '°C' },
    ],
    engineeringNotes: 'Porsche Ceramic Composite Brakes (PCCB) saving 50% unsprung rotational mass.',
    audioSignature: 'High-Friction Ceramic Pad Bedding Acoustic Resonance',
  },
  {
    id: 4,
    chapter: 'ACT IV // 04',
    title: 'The Open Alpine Skyway',
    subtitle: 'Open-Top Grand Tour at 2,504m Elevation',
    description:
      'An open-top convertible ascent under rolling cinematic clouds and crisp cool mountain air. Distant snow-capped peaks and winding valleys remain crystal clear miles into the horizon as passengers and children embrace the panoramic sky.',
    image: '/images/cinema-open-top-clouds.jpg',
    accentColor: '#10b981',
    telemetry: [
      { label: 'Panoramic View', value: '360°', unit: 'Sky' },
      { label: 'Ambient Climate', value: 'Crisp', unit: 'Cool' },
      { label: 'Elevation', value: '2,504', unit: 'm' },
    ],
    engineeringNotes: 'Open-air acoustic aerodynamics with retractable soft-top and electro-hydraulic chassis stabilization.',
    audioSignature: 'Open-Air Alpine Breeze & Dual-Motor Acoustic Resonance',
  },
  {
    id: 5,
    chapter: 'ACT V // 05',
    title: "The Driver's Sanctuary",
    subtitle: 'Curved 16.8" OLED Cockpit & Tactile Race-Tex',
    description:
      'Low, focused seating position nestled inside double-glazed acoustic laminated glass. A freestanding curved instrument glass display renders real-time telemetry against ambient neon contours.',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#a855f7',
    telemetry: [
      { label: 'OLED Curve', value: '16.8', unit: 'inch' },
      { label: 'Soundstage', value: '21', unit: 'Speakers' },
      { label: 'Acoustic Glass', value: 'Dual', unit: 'Glazed' },
    ],
    engineeringNotes: 'Burmester 3D High-End Surround Sound with 1,455 watts and ribbon tweeters.',
    audioSignature: 'Binaural Double-Glazed Cabin Attenuation: -38 dB Ambient Noise',
  },
  {
    id: 6,
    chapter: 'ACT VI // 06',
    title: 'Telemetry & Genesis',
    subtitle: '938 Horsepower Channeled in 2.3 Seconds',
    description:
      'Launch Control engaged. Full 900-ampere rear pulse inverter saturation triggers instant torque delivery, catapulting 5,100 lbs of sculpted metal from 0 to 60 mph in 2.3 seconds.',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#f43f5e',
    telemetry: [
      { label: '0–60 MPH', value: '2.3', unit: 'sec' },
      { label: 'Peak Power', value: '938', unit: 'HP' },
      { label: 'Torque Launch', value: '1,110', unit: 'Nm' },
    ],
    engineeringNotes: '800V DC Silicon Carbide architecture with 320 kW peak charging capability.',
    audioSignature: 'Full-Throttle Porsche Electric Sport Sound Waveform Synthesis',
  },
  {
    id: 7,
    chapter: 'ACT VII // 07',
    title: 'The Masterpiece Unleashed',
    subtitle: 'Taycan Turbo S — Engineering Without Compromise',
    description:
      'The complete machine stands motionless against the morning light. A testament to motorsport heritage translated into pure high-voltage performance.',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85',
    accentColor: '#00f0ff',
    telemetry: [
      { label: 'WLTP Range', value: '590', unit: 'km' },
      { label: 'Top Track Speed', value: '161', unit: 'MPH' },
      { label: 'Torsional Rigidity', value: '42,000', unit: 'Nm/°' },
    ],
    engineeringNotes: 'Factory Zuffenhausen Zero-Impact Assembly Facility, Stuttgart, Germany.',
    audioSignature: 'Dual Synchronous Motors Cooldown Cycle & Thermal Pump Purge',
  },
];

interface TheArtOfMotionProps {
  onPlayFilm?: (film: CinemaFilm) => void;
  featuredFilm?: CinemaFilm;
}

export const TheArtOfMotion: React.FC<TheArtOfMotionProps> = ({
  onPlayFilm,
  featuredFilm,
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [inGarage, setInGarage] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const activeScene = MOTION_SCENES[activeSceneIndex];
  const vehicleSlug = 'porsche-taycan-turbo-s';

  useEffect(() => {
    setInGarage(isCarInGarage(vehicleSlug));
  }, [vehicleSlug]);

  // Optional auto-progression through scenes
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % MOTION_SCENES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleNext = () => {
    setActiveSceneIndex((prev) => (prev + 1) % MOTION_SCENES.length);
  };

  const handlePrev = () => {
    setActiveSceneIndex((prev) => (prev - 1 + MOTION_SCENES.length) % MOTION_SCENES.length);
  };

  const handleToggleGarage = () => {
    const updated = toggleCarInGarage(vehicleSlug);
    setInGarage(updated);
  };

  return (
    <section
      ref={sectionRef}
      id="art-of-motion"
      style={{
        position: 'relative',
        backgroundColor: '#040608',
        paddingTop: '6rem',
        paddingBottom: '6rem',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
      aria-label="The Art of Motion: Scroll-driven automotive storytelling"
    >
      {/* Dynamic Background Image Canvas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.22,
          filter: 'blur(30px) saturate(1.4)',
          transform: 'scale(1.1)',
          backgroundImage: `url(${activeScene.image})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          transition: 'background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(circle at 50% 30%, rgba(4, 6, 8, 0.4) 0%, rgba(4, 6, 8, 0.95) 85%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={14} />
              <span>Cinematic Visual Study</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              The Art of Motion
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '640px',
                marginTop: '0.5rem',
              }}
            >
              A 7-chapter visual progression breaking down the mechanical anatomy and aesthetic
              genesis of high-performance automotive engineering.
            </p>
          </div>

          {/* Chapter Scrubber Tracker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              style={{
                background: autoPlay ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${autoPlay ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                color: autoPlay ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '0.45rem 0.9rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Activity size={13} />
              {autoPlay ? 'Auto-Advancing [ON]' : 'Auto-Advance [OFF]'}
            </button>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={handlePrev}
                aria-label="Previous chapter"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next chapter"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 7 Chapter Timeline Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            marginBottom: '2.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
          role="tablist"
          aria-label="The Art of Motion chapters"
        >
          {MOTION_SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSceneIndex(idx)}
                style={{
                  background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'rgba(15, 20, 28, 0.6)',
                  border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderTop: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  borderRadius: '6px',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  minWidth: '120px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    marginBottom: '0.2rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Act 0{scene.id}
                </div>
                <div
                  style={{
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {scene.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Stage: Cinematic Visual Showcase + Telemetry Overlay */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
            backgroundColor: '#070a0f',
          }}
        >
          {/* Main Visual Image Viewport */}
          <div
            style={{
              position: 'relative',
              height: 'clamp(380px, 55vh, 600px)',
              overflow: 'hidden',
            }}
          >
            <img
              src={activeScene.image}
              alt={`${activeScene.title} - ${activeScene.subtitle}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Gradient Overlays for High-Contrast Text Legibility */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(7, 10, 15, 0.2) 0%, rgba(7, 10, 15, 0.5) 50%, rgba(7, 10, 15, 0.95) 100%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(7, 10, 15, 0.85) 0%, rgba(7, 10, 15, 0.2) 60%, rgba(7, 10, 15, 0.4) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Scene Badge Overlay (Top Left) */}
            <div
              style={{
                position: 'absolute',
                top: '1.75rem',
                left: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 3,
              }}
            >
              <span
                style={{
                  background: 'rgba(7, 10, 15, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                {activeScene.chapter}
              </span>
              <span
                style={{
                  background: 'rgba(7, 10, 15, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.65rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                }}
              >
                SCENE {activeScene.id} / 07
              </span>
            </div>

            {/* Audio Waveform Signature (Top Right) */}
            <div
              style={{
                position: 'absolute',
                top: '1.75rem',
                right: '2rem',
                zIndex: 3,
                background: 'rgba(7, 10, 15, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                display: 'none',
              }}
              className="desktop-only-badge"
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Activity size={12} />
                <span>{activeScene.audioSignature}</span>
              </div>
            </div>

            {/* Narrative & Scene Text (Bottom Left) */}
            <div
              style={{
                position: 'absolute',
                bottom: '2.5rem',
                left: '2rem',
                right: '2rem',
                maxWidth: '780px',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: activeScene.accentColor,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                  fontWeight: 700,
                }}
              >
                {activeScene.subtitle}
              </div>
              <h3
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  marginBottom: '0.85rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {activeScene.title}
              </h3>
              <p
                style={{
                  color: '#e2e8f0',
                  fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  maxWidth: '680px',
                }}
              >
                {activeScene.description}
              </p>
            </div>
          </div>

          {/* Lower Engineering & Telemetry Bar */}
          <div
            style={{
              padding: '1.75rem 2rem',
              backgroundColor: '#0a0d14',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            {/* Real-time Telemetry Stats */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '2rem',
              }}
            >
              {activeScene.telemetry.map((t, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {t.value}{' '}
                    {t.unit && (
                      <span style={{ fontSize: '0.8rem', color: activeScene.accentColor }}>
                        {t.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div
                style={{
                  borderLeft: '1px solid var(--border-subtle)',
                  paddingLeft: '1.5rem',
                  maxWidth: '320px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.2rem',
                  }}
                >
                  DISCLOSED PROVING GROUND RECORD
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {activeScene.engineeringNotes}
                </div>
              </div>
            </div>

            {/* Direct Interaction Actions for the Vehicle */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {/* Play Associated Grossglockner Film */}
              {featuredFilm && onPlayFilm && (
                <button
                  onClick={() => onPlayFilm(featuredFilm)}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Play size={15} fill="currentColor" />
                  Watch Alpine Film
                </button>
              )}

              {/* View Vehicle Specs Link */}
              <Link
                to={`/cars/${vehicleSlug}`}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                }}
              >
                <span>Vehicle Details</span>
                <ArrowRight size={14} />
              </Link>

              {/* Compare Machine */}
              <Link
                to={`/compare?cars=${vehicleSlug}`}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                }}
              >
                <ArrowLeftRight size={14} />
                <span>Compare</span>
              </Link>

              {/* Save to Garage */}
              <button
                onClick={handleToggleGarage}
                aria-label={inGarage ? 'Remove from Garage' : 'Save to Garage'}
                style={{
                  background: inGarage ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${inGarage ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                  color: inGarage ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {inGarage ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                <span>{inGarage ? 'In Garage' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
