import React, { useState } from 'react';
import { CINEMA_FILMS } from '../data/cinemaVideos';
import type { CinemaFilm } from '../data/cinemaVideos';
import { CarImage } from './CarImage';
import { CinemaPlayerModal } from './CinemaPlayerModal';
import { Play, Clock, MapPin, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoadCinemaPreview: React.FC = () => {
  const [selectedFilm, setSelectedFilm] = useState<CinemaFilm | null>(null);

  return (
    <section
      id="cinema"
      className="section"
      style={{
        backgroundColor: '#06080c',
        borderTop: '1px solid var(--border-subtle)',
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
            marginBottom: '3rem',
          }}
        >
          <div>
            <span className="section-eyebrow">Visual Motion</span>
            <h2 className="section-title">Road Cinema — Motion in High Fidelity</h2>
            <p className="section-subtitle">
              High-definition cinematic driving reels captured across mountain passes,
              desert tracks, and high-speed unrestricted corridors.
            </p>
          </div>

          <Link to="/cinema" className="btn btn-secondary">
            Enter Fullscreen Cinema Theater
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Film Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {CINEMA_FILMS.slice(0, 4).map((film) => (
            <article
              key={film.id}
              onClick={() => setSelectedFilm(film)}
              className="card-glass"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedFilm(film);
                }
              }}
              aria-label={`Watch ${film.title}`}
            >
              {/* Thumbnail Container */}
              <div
                style={{
                  position: 'relative',
                  height: '220px',
                  overflow: 'hidden',
                  backgroundColor: '#0a0d14',
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
                      'linear-gradient(180deg, rgba(7, 9, 13, 0.4) 0%, rgba(7, 9, 13, 0.85) 100%)',
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
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(7, 9, 13, 0.85)',
                      border: '1px solid rgba(0, 240, 255, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                      boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
                      transition: 'transform 0.3s ease, background-color 0.3s ease',
                    }}
                    className="cinema-play-hover"
                  >
                    <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />
                  </div>
                </div>

                {/* Top Duration and Aspect Ratio Badges */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    left: '0.85rem',
                    right: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    zIndex: 2,
                  }}
                >
                  <span className="badge badge-cyan">
                    <Film size={11} />
                    {film.aspectRatio} CINEMA
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#ffffff',
                      backgroundColor: 'rgba(7, 9, 13, 0.8)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                    }}
                  >
                    <Clock size={12} />
                    {film.duration}
                  </span>
                </div>

                {/* Vehicle Title Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '1rem',
                    right: '1rem',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    {film.vehicle}
                  </span>
                </div>
              </div>

              {/* Film Info */}
              <div
                style={{
                  padding: '1.5rem',
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
                    marginBottom: '0.5rem',
                  }}
                >
                  {film.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                  }}
                >
                  {film.description}
                </p>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <MapPin size={13} color="var(--accent-cyan)" />
                  <span>{film.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Interactive Driving Cinema Modal */}
      <CinemaPlayerModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </section>
  );
};
