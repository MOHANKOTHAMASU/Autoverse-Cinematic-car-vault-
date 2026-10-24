import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Activity,
  Sliders,
  AlertCircle
} from 'lucide-react';

export interface VehicleCinematicMediaProps {
  vehicleId?: string;
  vehicleSlug?: string;
  vehicleName: string;
  modelYear?: number;
  videoUrl?: string;
  fallbackPosterUrl: string;
  headlineMetric?: { label: string; value: string; unit: string };
  secondaryMetric?: { label: string; value: string; unit: string };
  locationTag?: string;
  autoPlay?: boolean;
  aspectRatio?: '21:9' | '16:9';
}

export const VehicleCinematicMedia: React.FC<VehicleCinematicMediaProps> = ({
  vehicleName,
  videoUrl = '/videos/cinema-reel.mp4',
  fallbackPosterUrl,
  headlineMetric = { label: '0–60 MPH', value: '2.3', unit: 's' },
  secondaryMetric = { label: 'PEAK OUTPUT', value: '938', unit: 'HP' },
  locationTag = 'Stelvio & Grossglockner Alpine Proving Ground',
  autoPlay = true,
  aspectRatio = '21:9',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(118);
  const [currentGForce, setCurrentGForce] = useState<number>(1.24);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Check user motion preferences and data-saver
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Telemetry fluctuation during playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSpeed((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(185, Math.max(88, prev + delta));
      });
      setCurrentGForce((prev) => {
        const delta = (Math.random() * 0.16) - 0.08;
        return parseFloat(Math.min(1.48, Math.max(0.85, prev + delta)).toFixed(2));
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleSlowMo = () => {
    if (!videoRef.current) return;
    const nextSlowMo = !isSlowMo;
    videoRef.current.playbackRate = nextSlowMo ? 0.45 : 1.0;
    setIsSlowMo(nextSlowMo);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio === '21:9' ? '21 / 9' : '16 / 9',
        minHeight: '340px',
        maxHeight: '620px',
        backgroundColor: '#04060a',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
      }}
    >
      {/* Video stream element or image fallback */}
      {!hasError && !prefersReducedMotion ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={fallbackPosterUrl}
          playsInline
          muted={isMuted}
          autoPlay={autoPlay}
          loop
          preload="metadata"
          onLoadedData={() => {
            setIsLoaded(true);
            if (autoPlay) setIsPlaying(true);
          }}
          onError={() => {
            // If primary video fails, verify error fallback without ever resorting to fish reels
            setHasError(true);
            setIsPlaying(false);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.05) brightness(0.92)',
            display: 'block',
            opacity: isLoaded ? 1 : 0.7,
            transition: 'opacity 0.6s ease',
          }}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={fallbackPosterUrl}
            alt={vehicleName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }}
          />
          {hasError && (
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(15, 20, 28, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertCircle size={14} color="#f59e0b" />
              <span>High-Definition Car Media Cached · Verified Fallback Active</span>
            </div>
          )}
        </div>
      )}

      {/* Cinematic Vignette & Ambient Top/Bottom Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(5,7,12,0.65) 0%, transparent 25%, transparent 70%, rgba(5,7,12,0.92) 100%)',
        }}
      />

      {/* Header HUD: Vehicle Tag, Location & Mode */}
      <div
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.15em',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: 'var(--accent-cyan)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Activity size={12} />
            <span>CINEMATIC MOTION REEL</span>
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {locationTag}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
          <button
            onClick={() => setShowHUD(!showHUD)}
            title="Toggle Live Telemetry HUD"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              backgroundColor: showHUD ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            <Sliders size={13} />
            <span>HUD</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry Data HUD (Center/Right Overlay) */}
      {showHUD && (
        <div
          style={{
            position: 'absolute',
            bottom: '4.5rem',
            left: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            pointerEvents: 'none',
          }}
        >
          {/* Dynamic Speed HUD */}
          <div
            style={{
              backgroundColor: 'rgba(8, 12, 18, 0.75)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              backdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: '0.5rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              CHASSIS VELOCITY
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                {isPlaying ? currentSpeed : '0'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>MPH</span>
            </div>
          </div>

          {/* Lateral G-Force HUD */}
          <div
            style={{
              backgroundColor: 'rgba(8, 12, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: '0.5rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>
              LATERAL ACCEL
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                {isPlaying ? currentGForce : '0.00'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>G</span>
            </div>
          </div>

          {/* Key Metric 1 */}
          <div
            style={{
              backgroundColor: 'rgba(8, 12, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: '0.5rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>
              {headlineMetric.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                {headlineMetric.value}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {headlineMetric.unit}
              </span>
            </div>
          </div>

          {/* Key Metric 2 */}
          <div
            style={{
              backgroundColor: 'rgba(8, 12, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: '0.5rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>
              {secondaryMetric.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                {secondaryMetric.value}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {secondaryMetric.unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cinematic Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(10, 14, 22, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '10px',
          padding: '0.55rem 1rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Left Controls: Play/Pause, Replay, Slow Motion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={togglePlay}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090e',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            {isPlaying ? <Pause size={17} fill="#07090e" /> : <Play size={17} fill="#07090e" style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={restartVideo}
            title="Restart Cinematic Sequence"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.75)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleSlowMo}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '4px',
              backgroundColor: isSlowMo ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${isSlowMo ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.12)'}`,
              color: isSlowMo ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
            }}
          >
            {isSlowMo ? '0.45x SLOW-MO' : '1.0x NORMAL'}
          </button>
        </div>

        {/* Center: Vehicle identification tag */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>
            {vehicleName}
          </span>
        </div>

        {/* Right Controls: Audio Mute, Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Binaural Audio' : 'Mute Audio'}
            style={{
              background: 'none',
              border: 'none',
              color: isMuted ? 'rgba(255, 255, 255, 0.6)' : 'var(--accent-cyan)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Expand Fullscreen Cinema"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.75)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
