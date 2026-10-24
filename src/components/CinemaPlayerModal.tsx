import React, { useState, useEffect, useRef } from 'react';
import type { CinemaFilm } from '../data/cinemaVideos';
import { CINEMA_FILMS } from '../data/cinemaVideos';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Gauge,
  Compass,
  Film,
  Sparkles,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ArrowLeftRight,
  RotateCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isCarInGarage, toggleCarInGarage } from '../utils/garage';

interface CinemaPlayerModalProps {
  film: CinemaFilm | null;
  onClose: () => void;
  onSelectFilm?: (film: CinemaFilm) => void;
}

export const CinemaPlayerModal: React.FC<CinemaPlayerModalProps> = ({
  film,
  onClose,
  onSelectFilm,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Mandatory: start muted per policy
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeCam, setActiveCam] = useState<'chase' | 'cockpit' | 'apex'>('chase');
  const [isEnded, setIsEnded] = useState(false);

  // Telemetry speed simulation
  const [simulatedSpeed, setSimulatedSpeed] = useState(128);

  // Garage bookmark state
  const [inGarage, setInGarage] = useState(false);
  const [garageToast, setGarageToast] = useState<string | null>(null);

  // Controls auto-hide timer
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (film) {
      setInGarage(isCarInGarage(film.vehicleSlug));
      setIsEnded(false);
      setHasError(false);
      setIsLoading(true);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [film]);

  // Lock body scroll and handle keyboard events
  useEffect(() => {
    if (!film) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'ArrowRight') {
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.key === 'ArrowLeft') {
        if (videoRef.current) videoRef.current.currentTime -= 5;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [film, onClose, isPlaying, isMuted]);

  // Dynamic telemetry update when playing
  useEffect(() => {
    if (!isPlaying || isEnded) return;
    const interval = setInterval(() => {
      setSimulatedSpeed((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.min(182, Math.max(94, prev + delta));
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, isEnded]);

  if (!film) return null;

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsEnded(false);
      }).catch(() => {
        // Fallback if autoplay restricted
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.volume === 0) {
      videoRef.current.volume = volume || 0.8;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !isEnded) {
        setShowControls(false);
      }
    }, 3500);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleGarage = () => {
    const newState = toggleCarInGarage(film.vehicleSlug);
    setInGarage(newState);
    setGarageToast(newState ? 'Saved to My Garage!' : 'Removed from My Garage');
    setTimeout(() => setGarageToast(null), 3000);
  };

  // Find other films for the "Related Films" carousel when finished or in gallery
  const relatedFilms = CINEMA_FILMS.filter((f) => f.id !== film.id).slice(0, 3);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(3, 5, 8, 0.96)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : '1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cinema-player-title"
    >
      {/* Toast Notification */}
      {garageToast && (
        <div
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 10002,
            backgroundColor: 'var(--accent-cyan)',
            color: '#07090d',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.8rem',
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={15} />
          <span>{garageToast}</span>
        </div>
      )}

      {/* Main Player Box */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: isFullscreen ? '100vw' : '1180px',
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '92vh',
          backgroundColor: '#07090d',
          border: isFullscreen ? 'none' : '1px solid var(--border-medium)',
          borderRadius: isFullscreen ? 0 : '14px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleUserActivity}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.75rem',
            backgroundColor: 'rgba(12, 16, 23, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
            zIndex: 5,
            transition: 'opacity 0.3s ease',
            opacity: showControls || isEnded ? 1 : 0,
            pointerEvents: showControls || isEnded ? 'auto' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">
              <Film size={12} /> {film.aspectRatio} CINEMA MASTER
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {film.manufacturer.toUpperCase()} // {film.vehicle.toUpperCase()}
            </span>
            <span className="badge" style={{ fontSize: '0.68rem' }}>
              {film.category}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            aria-label="Close cinema player"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Stage & Viewport */}
        <div
          style={{
            position: 'relative',
            aspectRatio: isFullscreen ? undefined : '21 / 9',
            flex: isFullscreen ? 1 : undefined,
            minHeight: '360px',
            backgroundColor: '#000000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={togglePlayPause}
        >
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            src={film.videoUrl}
            poster={film.poster}
            autoPlay={true}
            muted={isMuted}
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || film.durationSeconds);
                setIsLoading(false);
              }
            }}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => {
              setIsLoading(false);
              setIsPlaying(true);
            }}
            onEnded={() => {
              setIsPlaying(false);
              setIsEnded(true);
              setShowControls(true);
            }}
            onError={() => {
              if (
                videoRef.current &&
                !videoRef.current.src.endsWith('/videos/cinema-reel.mp4')
              ) {
                // Seamlessly fall back to verified local stream
                videoRef.current.src = '/videos/cinema-reel.mp4';
                videoRef.current.load();
                videoRef.current.play().catch(() => {
                  setIsLoading(false);
                });
              } else {
                setIsLoading(false);
                setHasError(true);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isEnded ? 'brightness(0.35)' : hasError ? 'brightness(0.5)' : undefined,
              transition: 'filter 0.5s ease',
            }}
          />

          {/* Letterbox Mask Accents */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12px',
              background: '#000000',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '12px',
              background: '#000000',
              pointerEvents: 'none',
            }}
          />

          {/* Loading Buffer Spinner */}
          {isLoading && !hasError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <Loader2 size={44} color="var(--accent-cyan)" className="ambient-breathe" />
            </div>
          )}

          {/* Fallback Error Display with Poster Backdrop */}
          {hasError && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                backgroundColor: 'rgba(7, 9, 13, 0.9)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '1.75rem 2.25rem',
                textAlign: 'center',
                maxWidth: '480px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle size={38} color="var(--accent-red)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Streaming Stream Unavailable
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Remote MP4 CDN stream encountered network restrictions. Displaying certified high-definition master stills and telemetry data.
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.src = '/videos/cinema-reel.mp4';
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {
                      setIsPlaying(false);
                      setIsLoading(false);
                    });
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                <RotateCcw size={14} />
                <span>Retry Stream</span>
              </button>
            </div>
          )}

          {/* Live Telemetry HUD Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              pointerEvents: 'none',
              transition: 'opacity 0.3s ease',
              opacity: showControls && !isEnded ? 1 : 0.85,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(7, 9, 13, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid rgba(0, 240, 255, 0.3)',
              }}
            >
              <Gauge size={14} color="var(--accent-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                {simulatedSpeed} MPH
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                TELEMETRY
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(7, 9, 13, 0.75)',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Compass size={12} />
              <span>{film.location}</span>
            </div>
          </div>

          {/* Camera Perspective Angle Switcher */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 3,
              display: 'flex',
              gap: '0.3rem',
              backgroundColor: 'rgba(7, 9, 13, 0.85)',
              padding: '0.25rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              transition: 'opacity 0.3s ease',
              opacity: showControls && !isEnded ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(['chase', 'cockpit', 'apex'] as const).map((cam) => (
              <button
                key={cam}
                onClick={() => setActiveCam(cam)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: activeCam === cam ? '#07090d' : 'var(--text-secondary)',
                  backgroundColor: activeCam === cam ? 'var(--accent-cyan)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {cam}
              </button>
            ))}
          </div>

          {/* Center Play/Pause Overlay Indicator when paused */}
          {!isPlaying && !isLoading && !isEnded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 240, 255, 0.95)',
                  color: '#07090d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 35px var(--accent-cyan-glow)',
                }}
              >
                <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />
              </div>
            </div>
          )}

          {/* End of Film Overlay (Related Films + Vehicle CTAs) */}
          {isEnded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(7, 9, 13, 0.88)',
                backdropFilter: 'blur(12px)',
                zIndex: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
                FILM COMPLETE // {film.duration}
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.5rem' }}>
                {film.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', marginBottom: '1.75rem' }}>
                Explore the verified engineering specifications, acceleration benchmarks, and interior appointments of the {film.vehicle}.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                <Link
                  to={`/cars/${film.vehicleSlug}`}
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  <span>View Vehicle Engineering Dossier</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to={`/compare?cars=${film.vehicleSlug}`}
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <ArrowLeftRight size={15} color="var(--accent-cyan)" />
                  <span>Compare Machine</span>
                </Link>

                <button
                  onClick={handleToggleGarage}
                  className={inGarage ? 'btn btn-secondary' : 'btn btn-ghost'}
                  style={{ borderColor: inGarage ? 'var(--accent-cyan)' : undefined }}
                >
                  {inGarage ? <BookmarkCheck size={16} color="var(--accent-cyan)" /> : <Bookmark size={16} />}
                  <span>{inGarage ? 'In My Garage' : 'Save to Garage'}</span>
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play().then(() => {
                        setIsPlaying(true);
                        setIsEnded(false);
                      }).catch(() => {});
                    }
                  }}
                  className="btn btn-ghost"
                >
                  <RotateCcw size={15} />
                  <span>Replay Film</span>
                </button>
              </div>

              {/* Related Reels */}
              {relatedFilms.length > 0 && onSelectFilm && (
                <div style={{ width: '100%', maxWidth: '780px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                    MORE DRIVING REELS IN AUTOVERSE CINEMA
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {relatedFilms.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectFilm(rel)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={rel.poster} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block' }}>
                            {rel.vehicle}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, display: 'block' }}>
                            {rel.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: 'rgba(12, 16, 23, 0.98)',
            borderTop: '1px solid var(--border-subtle)',
            zIndex: 5,
            transition: 'opacity 0.3s ease',
            opacity: showControls || isEnded ? 1 : 0,
            pointerEvents: showControls || isEnded ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Interactive Seek Scrubber */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="range"
              min={0}
              max={duration || film.durationSeconds}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                height: '5px',
                accentColor: 'var(--accent-cyan)',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
              aria-label="Seek video playback"
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {/* Left Controls: Play/Pause, Mute, Volume, Timestamps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={togglePlayPause}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'var(--accent-cyan)',
                  color: isPlaying ? '#ffffff' : '#07090d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
                aria-label={isPlaying ? 'Pause film' : 'Play film'}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>

              <button
                onClick={toggleMute}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: isMuted ? 'var(--text-muted)' : 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label={isMuted ? 'Unmute engine audio' : 'Mute audio'}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: '75px',
                  height: '4px',
                  accentColor: 'var(--accent-cyan)',
                  cursor: 'pointer',
                }}
                aria-label="Volume level"
              />

              {/* Timestamp Counter */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#ffffff' }}>{formatTime(currentTime)}</span>
                <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>/</span>
                <span>{formatTime(duration || film.durationSeconds)}</span>
              </div>
            </div>

            {/* Right Controls: Vehicle Details Link & Fullscreen */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={`/cars/${film.vehicleSlug}`}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                onClick={onClose}
              >
                <span>{film.vehicle} Specs</span>
                <ArrowRight size={13} />
              </Link>

              <button
                onClick={toggleFullscreen}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
