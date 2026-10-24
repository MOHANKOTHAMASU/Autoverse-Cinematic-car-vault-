// AutoVerse — Centralized Cinema Video Configuration
// Stage 5: "Road Cinema" Master Video Metadata & Streaming Catalog

export type FilmCategory =
  | 'All'
  | 'Electric Performance'
  | 'Supercars and Hypercars'
  | 'Luxury and Comfort'
  | 'Track and Motorsport'
  | 'Grand Touring'
  | 'Night Drives'
  | 'Engineering and Innovation';

export interface CinemaFilm {
  id: string;
  title: string;
  subtitle: string;
  category: FilmCategory;
  vehicle: string;
  vehicleSlug: string;
  manufacturer: string;
  modelYear: number;
  duration: string;
  durationSeconds: number;
  location: string;
  description: string;
  directorNote: string;
  aspectRatio: string;
  poster: string;
  videoUrl: string;
  fallbackVideoUrl?: string;
  highlightStats: {
    label: string;
    value: string;
    unit?: string;
  }[];
  featured?: boolean;
  publicationStatus?: 'draft' | 'published' | 'unpublished' | 'archived';
  displayOrder?: number;
}

export const FILM_CATEGORIES: FilmCategory[] = [
  'All',
  'Electric Performance',
  'Supercars and Hypercars',
  'Luxury and Comfort',
  'Track and Motorsport',
  'Grand Touring',
  'Night Drives',
  'Engineering and Innovation',
];

export const CINEMA_FILMS: CinemaFilm[] = [
  {
    id: 'film-taycan-alpine',
    title: 'Grossglockner High Alpine Ascent',
    subtitle: 'Chasing the Dawn at 2,504 Meters Elevation',
    category: 'Electric Performance',
    vehicle: 'Taycan Turbo S',
    vehicleSlug: 'porsche-taycan-turbo-s',
    manufacturer: 'Porsche',
    modelYear: 2024,
    duration: '03:45',
    durationSeconds: 225,
    location: 'Grossglockner High Alpine Pass & Araku Valley Mountain Ghats',
    description: 'Chasing first light across winding alpine switchbacks and misty mountain ghat passes. 938 horsepower channeled through dual permanently excited synchronous motors.',
    directorNote: 'Filmed in anamorphic 2.39:1 widescreen format with gyroscopic roof-mounted camera rig and binaural powertrain audio recordings.',
    aspectRatio: '21:9',
    poster: '/images/cinema-open-top-clouds.jpg',
    videoUrl: '/videos/araku-hill-climb.mp4',
    fallbackVideoUrl: '/videos/cinema-reel.mp4',
    featured: true,
    highlightStats: [
      { label: '0–60 MPH', value: '2.3', unit: 'sec' },
      { label: 'System Output', value: '938', unit: 'HP' },
      { label: 'Voltage', value: '800V', unit: 'DC' },
    ],
  },
  {
    id: 'film-model-s-plaid-desert',
    title: 'Mojave Desert Midnight Velocity',
    subtitle: 'The 200 MPH Thermal Sprint',
    category: 'Supercars and Hypercars',
    vehicle: 'Model S Plaid',
    vehicleSlug: 'tesla-model-s-plaid',
    manufacturer: 'Tesla',
    modelYear: 2024,
    duration: '04:15',
    durationSeconds: 255,
    location: 'Dry Lakebed Corridor, Mojave Desert, California',
    description: 'A blistering straight-line acoustic sprint across dry lakebed flats. Carbon-sleeved tri-motor rotors spinning beyond 20,000 RPM into the desert horizon.',
    directorNote: 'Captured with high-speed cinematic chase drones operating at 120 mph with infrared thermal imaging overlays.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    featured: false,
    highlightStats: [
      { label: '0–60 MPH', value: '1.99', unit: 'sec' },
      { label: 'System Output', value: '1,020', unit: 'HP' },
      { label: 'Top Track Speed', value: '200', unit: 'MPH' },
    ],
  },
  {
    id: 'film-audi-rs-etron-autobahn',
    title: 'Midnight Autobahn Flight',
    subtitle: 'High-Speed Acoustic Aerodynamics',
    category: 'Night Drives',
    vehicle: 'RS e-tron GT',
    vehicleSlug: 'audi-rs-etron-gt',
    manufacturer: 'Audi',
    modelYear: 2024,
    duration: '03:18',
    durationSeconds: 198,
    location: 'A8 Autobahn, Stuttgart to Munich Corridor',
    description: 'High-speed aerodynamic cruising under sodium highway lights. Precision electric quattro stability maintaining absolute composure at 155 mph.',
    directorNote: 'Cockpit-focused cinematography featuring dynamic cabin ambient illumination and acoustic soundstage recordings.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: '/videos/cinema-reel.mp4',
    highlightStats: [
      { label: '0–60 MPH', value: '3.1', unit: 'sec' },
      { label: 'Boost Output', value: '637', unit: 'HP' },
      { label: 'Architecture', value: '800V', unit: 'quattro' },
    ],
  },
  {
    id: 'film-amg-gt-coastal',
    title: 'Alpine Skyway — Open-Top High Altitude Grand Tour',
    subtitle: 'Real Clouds, Open Horizon & Crisp Mountain Climate',
    category: 'Grand Touring',
    vehicle: 'Mercedes-AMG SL 63 Roadster',
    vehicleSlug: 'mercedes-amg-gt-63-s',
    manufacturer: 'Mercedes-Benz',
    modelYear: 2024,
    duration: '05:02',
    durationSeconds: 302,
    location: 'Grossglockner High Alpine Skyway & Panoramic Valley Overlook',
    description: 'A breathtaking open-top convertible tour under rolling cumulus clouds and crisp cool mountain air. Far distant snow-capped alpine peaks and winding valleys remain visible for miles as children and family embrace the panoramic sky and cool breeze with the roof retracted.',
    directorNote: 'Filmed with ultra-wide 8K gyro-stabilized anamorphic lenses capturing distant alpine horizons, natural cloud movement, and open-air acoustic resonance.',
    aspectRatio: '21:9',
    poster: '/images/cinema-open-top-clouds.jpg',
    videoUrl: '/videos/araku-hill-climb.mp4',
    fallbackVideoUrl: '/videos/cinema-reel.mp4',
    featured: true,
    highlightStats: [
      { label: '0–60 MPH', value: '3.5', unit: 'sec' },
      { label: 'Twin-Turbo V8', value: '577', unit: 'HP' },
      { label: 'Roof Retract', value: '15 sec', unit: 'Z-Fold' },
    ],
  },
  {
    id: 'film-bmw-m4-willow',
    title: 'Big Willow Apex Mastery',
    subtitle: 'Pushing the S58 Twin-Turbo to 7,200 RPM',
    category: 'Track and Motorsport',
    vehicle: 'M4 Competition Coupé',
    vehicleSlug: 'bmw-m4-competition',
    manufacturer: 'BMW',
    modelYear: 2024,
    duration: '04:30',
    durationSeconds: 270,
    location: 'Big Willow Raceway, Willow Springs, California Desert',
    description: 'Flat-out through high-speed Turns 8 and 9. S58 twin-turbo inline-six screaming to redline with M xDrive rear differential rotation on sticky Michelin Cup 2 tires.',
    directorNote: 'High frame-rate 120 FPS high-speed cinematography capturing mechanical suspension deflection and exhaust flame transients.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: '/videos/cinema-reel.mp4',
    highlightStats: [
      { label: '0–60 MPH', value: '3.4', unit: 'sec' },
      { label: 'Peak Power', value: '523', unit: 'HP' },
      { label: 'Redline', value: '7,200', unit: 'RPM' },
    ],
  },
  {
    id: 'film-gt3-rs-nurburgring',
    title: 'Green Hell Downforce Assault',
    subtitle: '860 kg Downforce at 9,000 RPM',
    category: 'Track and Motorsport',
    vehicle: '911 GT3 RS',
    vehicleSlug: 'porsche-911-gt3-rs',
    manufacturer: 'Porsche',
    modelYear: 2024,
    duration: '06:49',
    durationSeconds: 409,
    location: 'Nürburgring Nordschleife, Eifel Mountains, Germany',
    description: 'A 6-minute, 49-second lap of the grueling Nürburgring Nordschleife. DRS active aerodynamic wing adjusting in real time as the 4.0L naturally aspirated boxer screams to 9,000 RPM.',
    directorNote: 'Driver helmet cam synchronized with live CAN-bus telemetry showing steering angle, G-forces, and DRS wing activation.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    highlightStats: [
      { label: '0–60 MPH', value: '3.0', unit: 'sec' },
      { label: 'Engine Redline', value: '9,000', unit: 'RPM' },
      { label: 'Downforce', value: '1,895', unit: 'lbs' },
    ],
  },
  {
    id: 'film-electric-innovation',
    title: 'Silicon & High-Voltage Architecture',
    subtitle: '800V Thermal Engineering & Fast-Charging Dynamics',
    category: 'Engineering and Innovation',
    vehicle: 'Taycan Turbo S',
    vehicleSlug: 'porsche-taycan-turbo-s',
    manufacturer: 'Porsche',
    modelYear: 2024,
    duration: '03:12',
    durationSeconds: 192,
    location: 'Porsche Weissach Development Center, Germany',
    description: 'An engineering deep dive into hairpin copper stator winding, silicon carbide pulse inverters, and high-current 320 kW DC fast-charging thermodynamics.',
    directorNote: 'Thermal imaging and technical micro-optics examining underbody battery thermal management circuits.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: '/videos/cinema-reel.mp4',
    highlightStats: [
      { label: 'Peak DC Charge', value: '320', unit: 'kW' },
      { label: '10–80% Duration', value: '18', unit: 'min' },
      { label: 'Architecture', value: '800V', unit: 'DC' },
    ],
  },
  {
    id: 'film-executive-sanctuary',
    title: 'Acoustic Sanctuary — Night Flight',
    subtitle: 'Whisper-Silent Comfort in the Urban Core',
    category: 'Luxury and Comfort',
    vehicle: 'RS e-tron GT',
    vehicleSlug: 'audi-rs-etron-gt',
    manufacturer: 'Audi',
    modelYear: 2024,
    duration: '03:55',
    durationSeconds: 235,
    location: 'Berlin Metropolis Corridor, Germany',
    description: 'Exploring double-glazed acoustic laminated glass, Bang & Olufsen 3D soundstages, and active microparticle air filtration during a late-night city glide.',
    directorNote: 'High dynamic range low-light cinema capture emphasizing cockpit ambient lighting reflections and passenger silence.',
    aspectRatio: '21:9',
    poster: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/cinema-reel.mp4',
    fallbackVideoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    highlightStats: [
      { label: 'Cabin Noise', value: 'Acoustic', unit: 'Glass' },
      { label: 'Audio Brand', value: 'Bang & Olufsen', unit: '3D' },
      { label: 'Climate', value: '3-Zone', unit: 'HEPA' },
    ],
  },
];
