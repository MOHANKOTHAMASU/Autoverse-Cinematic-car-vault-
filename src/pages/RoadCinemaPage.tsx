import React, { useState, useMemo, useRef } from 'react';
import {
  CINEMA_FILMS,
  FILM_CATEGORIES,
} from '../data/cinemaVideos';
import type { CinemaFilm, FilmCategory } from '../data/cinemaVideos';
import { CinemaPlayerModal } from '../components/CinemaPlayerModal';
import { TheArtOfMotion } from '../components/TheArtOfMotion';
import { CarImage } from '../components/CarImage';
import {
  Play,
  Search,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Sparkles,
  Film,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isCarInGarage, toggleCarInGarage } from '../utils/garage';

export const RoadCinemaPage: React.FC = () => {
  // Modal player state
  const [activeFilm, setActiveFilm] = useState<CinemaFilm | null>(null);

  // Gallery filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilmCategory>('All');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'duration-asc' | 'duration-desc' | 'year' | 'title'>('featured');

  // Manufacturer showcase tab
  const [activeManufacturerTab, setActiveManufacturerTab] = useState<string>('Porsche');

  // Garage states for individual cards
  const [, setGarageUpdated] = useState(0);

  // Video hero ref
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);

  // Primary featured film (Grossglockner Alpine Pass)
  const featuredFilm = CINEMA_FILMS.find((f) => f.featured) || CINEMA_FILMS[0];

  // List of distinct manufacturers in cinema
  const cinemaManufacturers = useMemo(() => {
    const list = Array.from(new Set(CINEMA_FILMS.map((f) => f.manufacturer)));
    return ['All', ...list];
  }, []);

  // Filter and sort films
  const filteredFilms = useMemo(() => {
    let result = CINEMA_FILMS.filter((film) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = film.title.toLowerCase().includes(q);
        const matchesSubtitle = film.subtitle.toLowerCase().includes(q);
        const matchesVehicle = film.vehicle.toLowerCase().includes(q);
        const matchesBrand = film.manufacturer.toLowerCase().includes(q);
        const matchesLocation = film.location.toLowerCase().includes(q);
        const matchesDesc = film.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubtitle && !matchesVehicle && !matchesBrand && !matchesLocation && !matchesDesc) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && film.category !== selectedCategory) {
        return false;
      }

      // Manufacturer filter
      if (selectedManufacturer !== 'All' && film.manufacturer !== selectedManufacturer) {
        return false;
      }

      return true;
    });

    // Sort result
    if (sortBy === 'duration-asc') {
      result = [...result].sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sortBy === 'duration-desc') {
      result = [...result].sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === 'year') {
      result = [...result].sort((a, b) => b.modelYear - a.modelYear);
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // featured
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedManufacturer, sortBy]);

  // Handle garage toggle
  const handleToggleGarage = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCarInGarage(slug);
    setGarageUpdated((prev) => prev + 1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedManufacturer('All');
    setSortBy('featured');
  };

  // Manufacturer editorial metadata
  const MANUFACTURER_EDITORIALS: Record<
    string,
    {
      title: string;
      philosophy: string;
      heroImage: string;
      accent: string;
      quote: string;
      catalogSlug: string;
    }
  > = {
    Porsche: {
      title: 'Motorsport Heritage in Pure Voltage',
      philosophy:
        'Born on the Nürburgring and perfected across alpine switchbacks. Porsche engineering treats electricity not as an alternative, but as the ultimate acceleration vector.',
      heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      accent: '#00f0ff',
      quote: '“There is no substitute.” — Ferry Porsche',
      catalogSlug: 'porsche',
    },
    Tesla: {
      title: 'Sub-Two-Second Thermal Domination',
      philosophy:
        'Tri-motor architecture spinning carbon-sleeved rotors beyond 20,000 RPM. Relentless software-defined powertrain precision delivering 1,020 hp across dry lakebed flats.',
      heroImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
      accent: '#ef4444',
      quote: 'Accelerating the world into high-voltage performance.',
      catalogSlug: 'tesla',
    },
    Audi: {
      title: 'Vorsprung durch Technik — High-Speed Aerodynamics',
      philosophy:
        'Double-glazed acoustic tranquility meets 800-volt high-speed grand touring. Gliding at 155 mph on the midnight Autobahn with electronic quattro stability.',
      heroImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
      accent: '#38bdf8',
      quote: 'Sculpted by the wind tunnel, tuned for acoustic serenity.',
      catalogSlug: 'audi',
    },
    BMW: {
      title: 'The Ultimate Driving Machine — Track Apex Mastery',
      philosophy:
        'S58 Twin-Turbo inline-six screaming to 7,200 RPM. Perfectly balanced 50:50 weight distribution with M xDrive active rear differential rotation.',
      heroImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
      accent: '#3b82f6',
      quote: 'Precision engineered for the circuit, unfiltered on asphalt.',
      catalogSlug: 'bmw',
    },
    'Mercedes-Benz': {
      title: 'Handcrafted AMG Power Meets Formula 1 Hybridization',
      philosophy:
        'Handcrafted 4.0L Biturbo V8 thunder harmonized with Formula 1 E Performance electric drive. From whisper-silent electric coasting to 831 horsepower fury.',
      heroImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      accent: '#10b981',
      quote: 'Driving Performance elevated through electric boost.',
      catalogSlug: 'mercedes-benz',
    },
  };

  const currentBrandEditorial = MANUFACTURER_EDITORIALS[activeManufacturerTab] || MANUFACTURER_EDITORIALS['Porsche'];
  const brandFilms = CINEMA_FILMS.filter((f) => f.manufacturer === activeManufacturerTab);

  return (
    <div
      style={{
        backgroundColor: '#040608',
        color: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* 1. CINEMATIC HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 'calc(var(--header-height) + 2rem)',
          paddingBottom: '4rem',
          overflow: 'hidden',
        }}
      >
        {/* Background Video / Optimized Poster Fallback */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          {!heroVideoFailed && (
            <video
              ref={heroVideoRef}
              src="/videos/araku-hill-climb.mp4"
              poster="/images/cinema-open-top-clouds.jpg"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setHeroVideoFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.70) contrast(1.08)',
                transform: 'scale(1.02)',
              }}
            />
          )}

          {heroVideoFailed && (
            <img
              src="/images/cinema-open-top-clouds.jpg"
              alt="AutoVerse Open-Top Alpine Drive with Real Clouds and Far Visibility"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.70) contrast(1.08)',
              }}
            />
          )}

          {/* Cinematic Vignette and Mesh Overlays */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(4, 6, 8, 0.2) 0%, rgba(4, 6, 8, 0.85) 75%, rgba(4, 6, 8, 1) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(4, 6, 8, 0.4) 0%, transparent 40%, rgba(4, 6, 8, 0.95) 90%, #040608 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Hero Content */}
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(7, 10, 15, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '999px',
              padding: '0.4rem 1.1rem',
              marginBottom: '1.75rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.2)',
            }}
          >
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              AUTOVERSE CINEMATIC REELS // VOL. 05
            </span>
          </div>

          {/* Animated Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 6.2rem)',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 0.95,
              marginBottom: '1.25rem',
              color: '#ffffff',
              textShadow: '0 0 50px rgba(0, 240, 255, 0.35)',
            }}
          >
            ROAD CINEMA
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.55rem)',
              color: '#cbd5e1',
              fontStyle: 'italic',
              fontWeight: 300,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em',
            }}
          >
            “Machines in motion. Stories without limits.”
          </p>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Immerse yourself in authentic driving reels captured across extreme alpine passes,
            track apexes, and midnight Autobahn corridors. All audio begins strictly muted per policy;
            unmute inside the player for full high-fidelity acoustics.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1.25rem',
              marginBottom: '3.5rem',
            }}
          >
            <button
              onClick={() => setActiveFilm(featuredFilm)}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 0 35px var(--accent-cyan-glow)',
              }}
            >
              <Play size={20} fill="currentColor" />
              Watch Featured Film
            </button>

            <a
              href="#gallery"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.75rem',
                fontSize: '1rem',
              }}
            >
              <Film size={18} />
              Explore All 8 Films
            </a>

            <a
              href="#art-of-motion"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>The Art of Motion</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Live Telemetry / Film Reel Ticker */}
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2.5rem',
              padding: '1rem 2rem',
              backgroundColor: 'rgba(7, 10, 15, 0.7)',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Curated Reels
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                }}
              >
                08 FILMS
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Disciplines
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                07 GENRES
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Marques
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                5 BRANDS
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Master Resolution
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                }}
              >
                21:9 CINEMA
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#featured-film"
          aria-label="Scroll to featured film"
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.3rem',
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            transition: 'color 0.2s ease',
          }}
        >
          <span>SCROLL TO ENTER</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* 2. FEATURED MASTER FILM BILLBOARD */}
      <section
        id="featured-film"
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundColor: '#07090d',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-eyebrow">HEADLINE RELEASE</span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Featured Master Film
            </h2>
          </div>

          <div
            onClick={() => setActiveFilm(featuredFilm)}
            style={{
              position: 'relative',
              height: 'clamp(420px, 60vh, 560px)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
            }}
            role="button"
            tabIndex={0}
            aria-label={`Watch featured film: ${featuredFilm.title}`}
          >
            <CarImage
              src={featuredFilm.poster}
              alt={featuredFilm.title}
              manufacturer={featuredFilm.manufacturer}
              style={{ width: '100%', height: '100%' }}
            />

            {/* Gradient Overlays */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(7, 9, 13, 0.3) 0%, rgba(7, 9, 13, 0.6) 45%, rgba(7, 9, 13, 0.95) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Center Play Beacon */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(7, 9, 13, 0.85)',
                  border: '2px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 45px var(--accent-cyan-glow)',
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                }}
              >
                <Play size={38} fill="currentColor" style={{ marginLeft: '4px' }} />
              </div>
            </div>

            {/* Top Badges */}
            <div
              style={{
                position: 'absolute',
                top: '2rem',
                left: '2.5rem',
                right: '2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                <Film size={13} />
                {featuredFilm.category.toUpperCase()} // {featuredFilm.aspectRatio} CINEMA
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(7, 9, 13, 0.85)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Clock size={14} />
                {featuredFilm.duration}
              </span>
            </div>

            {/* Bottom Info Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '2.5rem',
                left: '2.5rem',
                right: '2.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: '1.5rem',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-cyan)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}
                >
                  {featuredFilm.modelYear} {featuredFilm.manufacturer} {featuredFilm.vehicle}
                </div>
                <h3
                  style={{
                    fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                    color: '#ffffff',
                    fontWeight: 900,
                    marginBottom: '0.6rem',
                    lineHeight: 1.15,
                  }}
                >
                  {featuredFilm.title}
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
                  {featuredFilm.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    marginTop: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--accent-cyan)" /> {featuredFilm.location}
                  </span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  {featuredFilm.highlightStats.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(7, 9, 13, 0.8)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        {s.value} {s.unit}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    to={`/cars/${featuredFilm.vehicleSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    View Specs
                  </Link>
                  <Link
                    to={`/compare?cars=${featuredFilm.vehicleSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    Compare
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED AUTOMOTIVE FILM GALLERY */}
      <section
        id="gallery"
        style={{
          paddingTop: '6rem',
          paddingBottom: '6rem',
          backgroundColor: '#05070a',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <span className="section-eyebrow">CURATED COLLECTION</span>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                Automotive Film Gallery
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.05rem',
                  maxWidth: '650px',
                  marginTop: '0.5rem',
                }}
              >
                Explore 8 cinema reels across Electric Performance, Supercars, Track,
                Luxury, Grand Touring, Night Drives, and Engineering.
              </p>
            </div>

            {/* Results count */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
              }}
            >
              SHOWING {filteredFilms.length} OF {CINEMA_FILMS.length} REELS
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div
            style={{
              background: '#090d14',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Search Input & Sort Dropdown */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 300px',
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search reels by title, vehicle, manufacturer, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    backgroundColor: '#05070a',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Sort Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <SlidersHorizontal size={16} color="var(--text-muted)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  SORT BY:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'featured' | 'duration-asc' | 'duration-desc' | 'year' | 'title'
                    )
                  }
                  style={{
                    backgroundColor: '#05070a',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="featured">Featured First</option>
                  <option value="duration-asc">Duration (Short to Long)</option>
                  <option value="duration-desc">Duration (Long to Short)</option>
                  <option value="year">Model Year (Newest)</option>
                  <option value="title">Title (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                }}
              >
                Disciplines / Categories:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                }}
              >
                {FILM_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        backgroundColor: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manufacturer Filter Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.85rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Marque:
              </span>
              {cinemaManufacturers.map((brand) => {
                const isActive = selectedManufacturer === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedManufacturer(brand)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '4px',
                      border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      backgroundColor: isActive ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {brand}
                  </button>
                );
              })}

              {(searchQuery || selectedCategory !== 'All' || selectedManufacturer !== 'All' || sortBy !== 'featured') && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredFilms.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                backgroundColor: '#090d14',
                borderRadius: '12px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <Film size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                No Films Match Your Current Query
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '480px',
                  margin: '0 auto 1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                We could not find any automotive reels matching “{searchQuery}” in category “{selectedCategory}”.
              </p>
              <button onClick={handleResetFilters} className="btn btn-secondary">
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          )}

          {/* Film Grid */}
          {filteredFilms.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '2rem',
              }}
            >
              {filteredFilms.map((film) => {
                const inGarage = isCarInGarage(film.vehicleSlug);

                return (
                  <article
                    key={film.id}
                    onClick={() => setActiveFilm(film)}
                    className="card-glass"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-medium)',
                      transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveFilm(film);
                      }
                    }}
                    aria-label={`Watch ${film.title}`}
                  >
                    {/* Thumbnail Viewport */}
                    <div
                      style={{
                        position: 'relative',
                        height: '230px',
                        backgroundColor: '#0a0d14',
                        overflow: 'hidden',
                      }}
                    >
                      <CarImage
                        src={film.poster}
                        alt={film.title}
                        manufacturer={film.manufacturer}
                      />

                      {/* Vignette Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(7, 9, 13, 0.3) 0%, rgba(7, 9, 13, 0.85) 100%)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Center Play Button Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(7, 9, 13, 0.85)',
                            border: '1.5px solid var(--accent-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-cyan)',
                            boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <Play size={24} fill="currentColor" style={{ marginLeft: '2px' }} />
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.85rem',
                          left: '0.85rem',
                          right: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          zIndex: 3,
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: 'rgba(7, 9, 13, 0.85)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            color: 'var(--accent-cyan)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          {film.category}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: 'rgba(7, 9, 13, 0.85)',
                            color: '#ffffff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <Clock size={12} />
                          {film.duration}
                        </span>
                      </div>

                      {/* Bottom Machine Model Year Tag */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.75rem',
                          left: '1rem',
                          right: '1rem',
                          zIndex: 3,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: 'var(--accent-cyan)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          {film.modelYear} {film.vehicle}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {film.aspectRatio}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div
                      style={{
                        padding: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          marginBottom: '0.35rem',
                          lineHeight: 1.25,
                        }}
                      >
                        {film.title}
                      </h3>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--accent-cyan)',
                          fontStyle: 'italic',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {film.subtitle}
                      </div>

                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.55,
                          marginBottom: '1rem',
                        }}
                      >
                        {film.description}
                      </p>

                      {/* Verified Performance Stats Strip */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        {film.highlightStats.map((stat, sIdx) => (
                          <div key={sIdx} style={{ textAlign: 'center' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.62rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {stat.label}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: '#ffffff',
                              }}
                            >
                              {stat.value}{' '}
                              <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                                {stat.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Location Pin */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <MapPin size={13} color="var(--accent-cyan)" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {film.location}
                        </span>
                      </div>

                      {/* Card Action Row */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/cars/${film.vehicleSlug}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              textDecoration: 'none',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <span>Specs</span>
                            <ArrowRight size={12} />
                          </Link>

                          <Link
                            to={`/compare?cars=${film.vehicleSlug}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              textDecoration: 'none',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <ArrowLeftRight size={12} />
                            <span>Compare</span>
                          </Link>
                        </div>

                        {/* Save to garage */}
                        <button
                          onClick={(e) => handleToggleGarage(film.vehicleSlug, e)}
                          title={inGarage ? 'Remove from Garage' : 'Save to Garage'}
                          aria-label={inGarage ? 'Remove from Garage' : 'Save to Garage'}
                          style={{
                            background: inGarage ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                            border: `1px solid ${inGarage ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                            color: inGarage ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            borderRadius: '4px',
                            padding: '0.35rem 0.55rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {inGarage ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          <span>{inGarage ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. SCROLL-DRIVEN STORYTELLING: THE ART OF MOTION */}
      <TheArtOfMotion
        featuredFilm={featuredFilm}
        onPlayFilm={(film) => setActiveFilm(film)}
      />

      {/* 5. MANUFACTURER FILM EXPERIENCES */}
      <section
        id="manufacturers"
        style={{
          paddingTop: '6rem',
          paddingBottom: '6rem',
          backgroundColor: '#07090d',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="section-eyebrow">MARQUE SPOTLIGHT</span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                fontWeight: 900,
                color: '#ffffff',
              }}
            >
              Manufacturer Film Collections
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '650px',
                marginTop: '0.5rem',
              }}
            >
              Examine the cinematic design philosophies and engineering DNA defining
              each world-class automotive marque.
            </p>
          </div>

          {/* Manufacturer Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '2.5rem',
            }}
          >
            {Object.keys(MANUFACTURER_EDITORIALS).map((brand) => {
              const isActive = activeManufacturerTab === brand;
              return (
                <button
                  key={brand}
                  onClick={() => setActiveManufacturerTab(brand)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                    backgroundColor: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {/* Active Brand Feature Card */}
          <div
            style={{
              backgroundColor: '#090d14',
              borderRadius: '16px',
              border: '1px solid var(--border-medium)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              padding: 'clamp(1.5rem, 3vw, 3rem)',
              marginBottom: '3rem',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: currentBrandEditorial.accent,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {activeManufacturerTab} CINEMATOGRAPHY PROFILE
              </div>
              <h3
                style={{
                  fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '1rem',
                  lineHeight: 1.2,
                }}
              >
                {currentBrandEditorial.title}
              </h3>
              <p
                style={{
                  color: '#cbd5e1',
                  fontSize: '1rem',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                }}
              >
                {currentBrandEditorial.philosophy}
              </p>

              <blockquote
                style={{
                  borderLeft: `3px solid ${currentBrandEditorial.accent}`,
                  paddingLeft: '1rem',
                  margin: '0 0 1.75rem 0',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  fontSize: '0.92rem',
                }}
              >
                {currentBrandEditorial.quote}
              </blockquote>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  to={`/manufacturers/${currentBrandEditorial.catalogSlug}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.88rem' }}
                >
                  <span>Explore {activeManufacturerTab} Catalog</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to={`/compare`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.88rem' }}
                >
                  <ArrowLeftRight size={14} />
                  <span>Compare Lineup</span>
                </Link>
              </div>
            </div>

            {/* Brand Hero Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '320px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <img
                src={currentBrandEditorial.heroImage}
                alt={activeManufacturerTab}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(7, 10, 15, 0.1) 0%, rgba(7, 10, 15, 0.75) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  left: '1.25rem',
                  right: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {brandFilms.length} FILM{brandFilms.length > 1 ? 'S' : ''} IN CINEMA ARCHIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CINEMATIC CALL TO ACTION */}
      <section
        style={{
          position: 'relative',
          paddingTop: '6rem',
          paddingBottom: '6rem',
          backgroundColor: '#040608',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              padding: 'clamp(2.5rem, 5vw, 4.5rem)',
              backgroundColor: '#070a0f',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 240, 255, 0.1)',
              textAlign: 'center',
              maxWidth: '960px',
              margin: '0 auto',
              overflow: 'hidden',
            }}
          >
            {/* Subtle glow background */}
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '350px',
                background: 'radial-gradient(ellipse, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} />
              <span>THE EXPERIENCE CONTINUES</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              Take the Wheel. Transition From Viewer to Driver.
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#cbd5e1',
                maxWidth: '660px',
                margin: '0 auto 2.5rem',
                lineHeight: 1.65,
              }}
            >
              AutoVerse is more than a cinema experience. Cross-examine telemetry, compare
              drivetrain architectures side-by-side, save vehicles to your personal garage,
              or discover upcoming manufacturer launches.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Link
                to="/discover"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.85rem',
                  fontSize: '0.95rem',
                }}
              >
                <span>Explore Full Vehicle Catalog</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/compare"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.65rem',
                  fontSize: '0.95rem',
                }}
              >
                <ArrowLeftRight size={16} />
                <span>Open Machine Comparison</span>
              </Link>

              <Link
                to="/garage"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.65rem',
                  fontSize: '0.95rem',
                }}
              >
                <Bookmark size={16} />
                <span>View Saved Garage</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FULL-SCREEN CINEMATIC VIDEO PLAYER MODAL */}
      <CinemaPlayerModal
        film={activeFilm}
        onClose={() => setActiveFilm(null)}
        onSelectFilm={(f) => setActiveFilm(f)}
      />
    </div>
  );
};
