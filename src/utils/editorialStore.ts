// AutoVerse Stage 13: Centralized Editorial Store, Article Engine & Review Registry
// Manages automotive journalism, road tests, launch verifications, reading lists & author profiles

import type {
  Article,
  CarReview,
  LaunchRecord,
  ReadingListItem,
  PublicationStatus,
  VerificationStatus,
  ArticleCategory,
} from '../types/editorial';
import { logAdminActivity } from './adminStore';

const ARTICLES_STORAGE_KEY = 'autoverse_editorial_articles_db';
const REVIEWS_STORAGE_KEY = 'autoverse_editorial_reviews_db';
const LAUNCHES_STORAGE_KEY = 'autoverse_editorial_launches_db';
const READING_LIST_STORAGE_KEY = 'autoverse_reading_list_db';

// Authors
export const EDITORIAL_AUTHORS = [
  {
    id: 'author_alexander_vance',
    name: 'Alexander Vance',
    role: 'Chief Technical Editor & Senior Test Driver',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Former powertrain validation engineer with 14 years evaluating sports cars and hypercars across the Nürburgring Nordschleife and Silverstone.',
    verifiedCredentials: 'FIA Homologation Observer / Certified High-Speed Test License',
  },
  {
    id: 'author_priya_sharma',
    name: 'Priya Sharma',
    role: 'South Asia Automotive Bureau Chief',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    bio: 'Specialist in Indian automotive manufacturing, Born-EV architectures, and regulatory crash test frameworks including Bharat NCAP.',
    verifiedCredentials: 'Autocar India Alum / Bharat NCAP Industry Panelist',
  },
  {
    id: 'author_marcus_lindholm',
    name: 'Marcus Lindholm',
    role: 'Electric Propulsion & Battery Systems Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Master of Science in Electrical Engineering from Chalmers. Author of benchmarking studies on 800V silicon carbide inverters and thermal runaway prevention.',
    verifiedCredentials: 'SAE International Fellow / IEEE Power Electronics Society',
  },
  {
    id: 'author_elena_rostova',
    name: 'Elena Rostova',
    role: 'Motorsport & Aerodynamics Correspondent',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    bio: 'Trackside reporter covering WEC Hypercar and Formula 1 technical developments with a focus on ground-effect aero and hybrid telemetry.',
    verifiedCredentials: 'FIA Accredited Journalist / WEC Press Bureau Member',
  },
];

// Seed Articles
const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'art_porsche_taycan_gt_record',
    slug: 'porsche-taycan-turbo-gt-nurburgring-record-analysis',
    title: 'Porsche Taycan Turbo GT: Dissecting the 7:07.55 Nürburgring Lap Record',
    subtitle: 'How 1,092 HP Attack Mode, 900A Silicon Carbide Inverters, and Weissach Aero Conquered the Green Hell',
    excerpt: 'An in-depth engineering assessment of how Porsche reclaimed the series-production electric lap record on the Nürburgring Nordschleife by 26 seconds.',
    category: 'performance',
    tags: ['Porsche', 'Taycan Turbo GT', 'Nürburgring', 'Track Test', 'Electric Vehicle'],
    author: EDITORIAL_AUTHORS[0],
    heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'The Porsche Taycan Turbo GT with Weissach Package navigating the Karussell during its record-setting lap.',
    imageCredit: 'Porsche AG Pressroom / Nürburgring 1927 GmbH',
    publicationStatus: 'published',
    publishedAt: '2024-09-18T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    readingTimeMinutes: 7,
    isFeatured: true,
    isTrending: true,
    relatedVehicleSlugs: ['porsche-taycan-turbo-s', 'porsche-911-gt3-rs', 'rimac-nevera'],
    articleType: 'news',
    sourceReferences: [
      {
        title: 'Porsche Taycan Turbo GT sets new benchmark lap time at Nürburgring',
        publisher: 'Porsche AG Official Newsroom',
        url: 'https://newsroom.porsche.com/en/2024/products/porsche-taycan-turbo-gt-35496.html',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
      {
        title: 'Nürburgring Official Lap Record Timings: Electric Series Vehicles',
        publisher: 'Nürburgring 1927 GmbH & Co. KG',
        url: 'https://www.nuerburgring.de',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    content: `## The Green Hell Benchmark
When development driver Lars Kern crossed the timing beam at the Nürburgring Nordschleife in 7 minutes and 7.55 seconds, Porsche did not merely beat its previous Taycan Turbo S time by 26 seconds—it placed a four-door electric chassis within striking distance of pure racing machinery.

To put this telemetry into perspective, the Taycan Turbo GT with Weissach Package is roughly two seconds behind the Rimac Nevera (7:05.298), a bespoke 1,914-horsepower quad-motor hypercar with a $2.5 million price tag.

## Silicon Carbide Power Electronics
The technical cornerstone of the Turbo GT lies in its rear axle inverter. While standard Taycan models utilize silicon IGBT switches, the Turbo GT adopts semiconductor pulse inverters using silicon carbide (SiC) as the semiconductor material.

- **Current Capacity**: Increased from 600 amperes to a peak of 900 amperes on the rear axle.
- **Switching Frequency**: Operates at higher switching frequencies with significantly lower thermal losses.
- **Peak Output**: Up to 1,092 hp (815 kW) available for 10 seconds in Attack Mode via steering-wheel paddle trigger.

## Active Aerodynamics & Weight Reduction
The Weissach package achieves a 75 kg (165 lb) mass reduction over the Turbo S. This is accomplished not through carbon cosmetic veneer, but rigorous track-focused omissions:

1. Deletion of the rear seat bench, replaced by a bespoke lightweight carbon-fibre storage tray.
2. Removal of the analog Sport Chrono dashboard clock and footwell floor mats.
3. Lightweight ceramic composite brake discs (PCCB) shedding over 2 kg of unsprung rotational mass at each corner.
4. Fixed rear carbon-fibre wing producing up to 220 kg of downforce at 305 km/h.

## Chassis Dynamics: Porsche Active Ride
Standard on the Turbo GT is Porsche Active Ride suspension with motor-pump units on each wheel. By decoupling roll and pitch frequencies from wheel travel, the car remains virtually level through high-compression sectors like Fuchsröhre, preventing aerodynamic stalling and preserving contact patch integrity.`,
  },
  {
    id: 'art_tata_curvv_mahindra_thar',
    slug: 'tata-curvv-ev-mahindra-thar-roxx-india-automotive-renaissance',
    title: 'India’s Next Frontier: How Tata Curvv.ev and Mahindra Thar Roxx Redefined Segment Expectations',
    subtitle: 'From Dedicated Skateboard Born-EV Platforms to Five-Door Luxury Off-Roaders with 5-Star Bharat NCAP Ratings',
    excerpt: 'An investigative review of how domestic Indian automakers engineered two disparate automotive flagships that rival global benchmarks in build quality, safety, and powertrain calibration.',
    category: 'indian_auto',
    tags: ['Tata Motors', 'Mahindra', 'Curvv EV', 'Thar Roxx', 'Bharat NCAP', 'Electric Vehicle'],
    author: EDITORIAL_AUTHORS[1],
    heroImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'The Tata Curvv.ev aerodynamic coupé silhouette and Mahindra Thar Roxx rugged 4x4 stance.',
    imageCredit: 'AutoVerse South Asia Bureau / OEM Press Files',
    publicationStatus: 'published',
    publishedAt: '2024-09-24T08:30:00Z',
    updatedAt: '2024-10-18T11:15:00Z',
    readingTimeMinutes: 6,
    isFeatured: true,
    isTrending: false,
    relatedVehicleSlugs: ['tata-curvv-ev-empowered', 'mahindra-thar-roxx-ax7l'],
    articleType: 'analysis',
    sourceReferences: [
      {
        title: 'Tata Curvv.ev Technical Briefing & acti.ev Architecture Whitepaper',
        publisher: 'Tata Passenger Electric Mobility',
        url: 'https://ev.tatamotors.com/curvv.ev',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
      {
        title: 'Mahindra Thar Roxx 4G Platform Engineering Dossier',
        publisher: 'Mahindra & Mahindra Ltd Pressroom',
        url: 'https://auto.mahindra.com/suv/thar-roxx',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
      {
        title: 'Bharat NCAP Crash Test Assessment Protocol 2024',
        publisher: 'Ministry of Road Transport and Highways (MoRTH)',
        url: 'https://bcap.morth.gov.in',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    content: `## The Shift from Adaptation to Indigenous Architecture
For years, the Indian passenger market was characterized by modified global hatchbacks and badge-engineered entry crossovers. The arrival of the Tata Curvv.ev and the Mahindra Thar Roxx marks an epochal pivot toward indigenous, clean-sheet vehicle development.

Both manufacturers have decoupled from legacy platforms to engineer vehicles that compete globally on safety metrics, powertrain integration, and digital ergonomics.

## Tata Curvv.ev: The acti.ev Skateboard
The Curvv.ev is built on Tata’s dedicated pure-electric acti.ev architecture:
- **Prismatic Cell Chemistry**: 55 kWh pack offering 585 km certified ARAI range (~420 km real-world).
- **Fast-Charging Performance**: 1.2C charging rate allowing 150 km of highway range in 15 minutes on a 60 kW DC charger.
- **Bi-Directional V2L & V2V**: Standard vehicle-to-load and vehicle-to-vehicle power delivery up to 3.3 kVA.
- **Aerodynamic Aerodynamics**: Flush door handles and tapered aero rear spoiler achieving a 0.28 Cd drag coefficient.

## Mahindra Thar Roxx: Five Doors, Sophisticated Dynamics
Where the Curvv embraces electrification, the Thar Roxx reinvents ladder-frame off-roading:
- **4G Chassis with Watts Linkage**: Eliminates the lateral shimmy historically associated with solid rear axles.
- **Penta-Link Rear Suspension**: Frequency Dependent Damping (FDD) delivers uncompromised tarmac high-speed stability.
- **Full ADAS Level 2 Suite**: 10 autonomous safety functions calibrated specifically for chaotic Indian mixed traffic patterns.
- **Bharat NCAP 5-Star Rating**: Over 31 out of 32 points achieved in Adult Occupant Protection.

## Market Implications
These vehicles demonstrate that emerging markets no longer accept compromised safety or de-contented powertrains. With both models commanding multi-month order backlogs, they represent a watershed moment for Indian manufacturing prowess.`,
  },
  {
    id: 'art_bmw_m5_touring_g99',
    slug: 'bmw-m5-touring-g99-hybrid-v8-dossier',
    title: 'BMW M5 Touring (G99): 717 HP TwinPower Turbo V8 Hybrid Tech Deep Dive',
    subtitle: 'Why BMW M Chose a Heavy Plug-in Hybrid Architecture and What It Means for Wagon Enthusiasts',
    excerpt: 'An exhaustive technical exploration of the seventh-generation M5 Touring G99, featuring an electric motor integrated directly into the 8-speed M Steptronic transmission.',
    category: 'hybrid',
    tags: ['BMW', 'M5 Touring', 'G99', 'Hybrid', 'V8', 'Performance Wagon'],
    author: EDITORIAL_AUTHORS[2],
    heroImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'The BMW M5 Touring G99 showing its widened fenders and quad exhaust finishers.',
    imageCredit: 'BMW Group PressClub Global',
    publicationStatus: 'published',
    publishedAt: '2024-10-02T12:00:00Z',
    updatedAt: '2024-10-14T09:40:00Z',
    readingTimeMinutes: 5,
    isFeatured: false,
    isTrending: true,
    relatedVehicleSlugs: ['bmw-m5-touring-g99', 'porsche-taycan-turbo-s', 'audi-rs-etron-gt-performance'],
    articleType: 'news',
    sourceReferences: [
      {
        title: 'The New BMW M5 Touring Press Release Dossier',
        publisher: 'BMW AG Corporate Communications',
        url: 'https://www.press.bmwgroup.com',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    content: `## The Weight Debate
The headline figure surrounding the G90 Sedan and G99 Touring has been curb weight: 2,475 kg (5,456 lbs). Purists balked. Yet, when BMW M engineered this powertrain, they were bound by stringent Euro 7 emissions targets that would have strangled a pure combustion S63 V8.

Instead, BMW adopted the M HYBRID system derived from the BMW M Hybrid V8 LMDh endurance race car.

## The Dual-Heart Architecture
The powertrain combines:
1. **4.4-Liter TwinPower Turbo V8 (S68)**: Cross-bank exhaust manifold, reinforced crankshaft drive, and 585 hp on combustion alone.
2. **Integrated Permanently Excited Synchronous Motor**: 197 hp (145 kW) nestled into the bell housing of the 8-speed M Steptronic gearbox.
3. **Combined System Output**: 727 PS (717 hp) and a colossal 1,000 Nm (738 lb-ft) of system torque from 1,800 to 5,400 RPM.

## Pre-Gearing Technology
A patented BMW M pre-gearing stage increases the effective torque produced by the electric motor from 280 Nm to up to 450 Nm at the transmission input shaft. This eliminates any sensation of turbo lag, providing instant off-the-line thrust regardless of gear selection.

## Practicality Meets Track Rigidity
With 500 liters of luggage volume expanding to 1,630 liters with the rear seats folded, the G99 brings real estate to ultra-high-speed transit. Rear-wheel steering up to 1.5 degrees and active roll stabilization ensure the estate masks its mass on technical mountain passes.`,
  },
  {
    id: 'art_solid_state_battery_timeline',
    slug: 'solid-state-batteries-ev-range-reality-check',
    title: 'Solid-State & Silicon-Dominant Anodes: Separating Automotive Reality from Laboratory Claims',
    subtitle: 'Where Toyota, QuantumScape, CATL, and StoreDot Actually Stand on Series Homologation',
    excerpt: 'A pragmatic reality check on next-generation battery chemistries, cycle life degradation under winter conditions, and realistic delivery timelines for production vehicles.',
    category: 'technology',
    tags: ['Solid-State', 'Battery Technology', 'EV Engineering', 'CATL', 'QuantumScape'],
    author: EDITORIAL_AUTHORS[2],
    heroImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'Lithium solid-state pouch cell validation inside an environmental test chamber.',
    imageCredit: 'AutoVerse Technical Laboratory / Research Archive',
    publicationStatus: 'published',
    publishedAt: '2024-09-28T14:15:00Z',
    updatedAt: '2024-10-12T16:00:00Z',
    readingTimeMinutes: 8,
    isFeatured: false,
    isTrending: false,
    relatedVehicleSlugs: ['porsche-taycan-turbo-s', 'rimac-nevera', 'lucid-air-sapphire'],
    articleType: 'analysis',
    sourceReferences: [
      {
        title: 'Toyota Battery Technology Strategy Roadmap: Solid State Commercialization',
        publisher: 'Toyota Motor Corporation Global Newsroom',
        url: 'https://global.toyota/en',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
      {
        title: 'Solid-State Battery Industrialization Report 2024',
        publisher: 'BloombergNEF Advanced Energy Storage Study',
        url: 'https://about.bnef.com',
        checkedDate: 'October 2024',
        isOfficialBureau: false,
      },
    ],
    content: `## The Promise vs The Crucible
Solid-state batteries promise energy densities exceeding 450 Wh/kg, near-zero fire hazard, and 10-to-80% charge sessions under 10 minutes. However, the gulf between a coin-cell laboratory prototype and a 100 kWh automotive pack subjected to -30°C Minnesota winters and 100,000 miles of vibrations is vast.

## The Dendrite Dilemma
The central failure mode remains lithium dendrite formation. During ultra-fast charging, metallic lithium tends to deposit non-uniformly across solid ceramic or polymer electrolytes, eventually puncturing the separator and causing catastrophic short circuits.

- **Ceramic Separators**: Brittle, prone to micro-cracking under torsion.
- **Sulfide-Based Electrolytes**: Vulnerable to moisture, releasing toxic hydrogen sulfide if breached.
- **Polymer Electrolytes**: Require 60°C operating temperatures to achieve acceptable ionic conductivity.

## Near-Term Solution: Silicon-Dominant Liquid Chemistries
While true all-solid-state cells will not see high-volume series adoption before 2028–2030, silicon-dominant anodes in liquid electrolytes are entering production today:
- Replacing traditional graphite with 20–80% silicon nano-particles.
- Elevating volumetric density to ~320 Wh/kg without requiring re-tooled gigafactories.
- Enabling 4C charge rates (10–80% in 12 minutes) on existing 800V DC fast chargers.`,
  },
  {
    id: 'art_ferrari_f80_hypercar_reveal',
    slug: 'ferrari-f80-le-mans-v6-hybrid-reveal',
    title: 'Ferrari F80 Premiere: 1,200 HP Le Mans Hybrid V6 Inherits 499P Dominance',
    subtitle: 'Maranello Retires the V12 Flagship Lineage to Unleash Ground-Effect Aero and Formula 1 MGU-K Boost',
    excerpt: 'The successor to the LaFerrari, Enzo, and F40 arrives with an all-new 3.0-liter 120-degree twin-turbo V6, electric turbochargers (e-turbos), and active inboard suspension.',
    category: 'luxury',
    tags: ['Ferrari', 'F80', 'Hypercar', 'Le Mans', 'Hybrid', 'Maranello'],
    author: EDITORIAL_AUTHORS[3],
    heroImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'The Ferrari F80 hypercar sculpted with extreme aerodynamic tunnels and narrow cockpit.',
    imageCredit: 'Ferrari S.p.A. Media Center',
    publicationStatus: 'published',
    publishedAt: '2024-10-17T11:00:00Z',
    updatedAt: '2024-10-19T13:45:00Z',
    readingTimeMinutes: 6,
    isFeatured: false,
    isTrending: true,
    relatedVehicleSlugs: ['ferrari-sf90-stradale', 'porsche-911-gt3-rs', 'rimac-nevera'],
    articleType: 'news',
    sourceReferences: [
      {
        title: 'Ferrari F80 Official Press Release: A New Era of Maranello Supercars',
        publisher: 'Ferrari Media Center Maranello',
        url: 'https://www.ferrari.com',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    content: `## A Controversial Yet Conquering Heart
When Ferrari unveiled the F80, some enthusiasts lamented the absence of an atmospheric V12. Yet, Ferrari’s decision to install a 3.0-liter twin-turbo 120-degree V6 is directly rooted in championship victory: this engine shares its architecture and combustion chamber design with the 499P that conquered the 24 Hours of Le Mans in back-to-back victories.

## Powertrain Telemetry
- **Internal Combustion V6 (F163CF)**: 900 CV (888 hp) at an ear-splitting 9,000 RPM.
- **Three Electric Motors**: Two on the front axle (140 CV each) and one rear MGU-K motor.
- **Combined System Power**: 1,200 CV (1,184 hp).
- **0–100 km/h**: 2.15 seconds. Top speed: 350 km/h (217 mph).

## Active Aerodynamics: 1,050 kg of Downforce
At 250 km/h, the F80 produces 1,050 kg of downforce. This is achieved via:
1. Massive front S-Duct drawing air under the nose and ejecting it over the canopy.
2. Inboard 48V active suspension actuators by Multimatic maintaining pitch control within millimeters.
3. Giant active rear diffuser and deployable rear wing that alters angle-of-attack dynamically.

Strictly limited to 799 units worldwide with an introductory price tag of €3.6 million, every single chassis was accounted for prior to the public premiere.`,
  },
  {
    id: 'art_wec_hypercar_regulations_2025',
    slug: 'wec-imsa-hypercar-convergence-golden-age',
    title: 'WEC Hypercar Convergence: Why 2025 Is Endurance Racing’s Greatest Golden Era',
    subtitle: 'Porsche, Ferrari, Cadillac, BMW, Alpine, and Aston Martin Clash Under Balance of Performance',
    excerpt: 'How the unified LMH and LMDh regulatory framework created the most competitive international sports car championship in half a century.',
    category: 'motorsport',
    tags: ['Motorsport', 'WEC', 'IMSA', 'Le Mans', 'Hypercar', 'Porsche Penske'],
    author: EDITORIAL_AUTHORS[3],
    heroImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=80',
    imageCaption: 'Hypercar prototypes battling under headlights during the 24 Hours of Le Mans.',
    imageCredit: 'WEC Press Bureau / ACO Official',
    publicationStatus: 'published',
    publishedAt: '2024-09-12T09:00:00Z',
    readingTimeMinutes: 5,
    isFeatured: false,
    isTrending: false,
    relatedVehicleSlugs: ['porsche-911-gt3-rs', 'ferrari-sf90-stradale'],
    articleType: 'news',
    sourceReferences: [
      {
        title: 'FIA World Endurance Championship Technical Regulations 2024-2025',
        publisher: 'Fédération Internationale de l’Automobile (FIA)',
        url: 'https://www.fia.com',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    content: `## Regulatory Mastery: LMH vs LMDh
Not since the Group C era of the late 1980s has prototype racing witnessed such OEM manufacturer depth. By harmonizing Le Mans Hypercar (LMH) bespoke chassis with cost-effective LMDh spec-hybrid chassis (Dallara, Multimatic, Oreca, Ligier), the FIA and IMSA created a level playing field.

- **Power Window**: 500–520 kW (670–697 hp) strictly monitored via driveshaft torque sensors.
- **Aerodynamic Ratio**: 4:1 lift-to-drag target evaluated in the Windshear rolling-road wind tunnel.
- **Real-Time Telemetry**: Instant Balance of Performance (BoP) adjustments based on wet-weather energy allocation.

The result has been unpredictability: privateer teams like Jota and AF Corse regularly pressure factory outfits, creating genuine drama for automotive spectators.`,
  },
];

// Seed Car Reviews
const DEFAULT_REVIEWS: CarReview[] = [
  {
    id: 'rev_porsche_taycan_turbo_s',
    slug: 'porsche-taycan-turbo-s-road-test-review',
    title: 'Porsche Taycan Turbo S Road Test & Track Evaluation',
    vehicleSlug: 'porsche-taycan-turbo-s',
    variant: 'Turbo S Performance Battery Plus',
    overallScore: 9.3,
    categoryScores: {
      exteriorDesign: 9.5,
      interiorComfort: 9.0,
      technology: 9.2,
      performance: 9.8,
      practicality: 8.5,
      safety: 9.6,
    },
    verdictSummary:
      'The definitive benchmark for driver engagement in an electric performance vehicle. Unrivalled thermal repeatability, surgical steering feedback, and relentless 800V charging speed.',
    strengths: [
      'Devastating launch control repeatability with zero thermal derating',
      'Porsche Active Ride suspension decouples roll without ride harshness',
      '320 kW peak DC fast-charging allows 10-80% in under 18 minutes',
      'Tactile, low-slung driving position true to the 911 lineage',
    ],
    weaknesses: [
      'Substantial price escalation when optioning essential performance packages',
      'Rear passenger legroom remains intimate compared to traditional executive sedans',
      'Touchscreen haptic climate controls require glance away from road',
    ],
    suitableBuyerProfile:
      'The discerning driving enthusiast transitioning to electric propulsion who refuses to sacrifice steering nuance, high-speed lateral precision, or racetrack repeatability.',
    realWorldConsiderations:
      'Expect roughly 285 miles of highway cruising at 70 mph in moderate climates, decreasing by ~18% in freezing conditions with cabin heating active. 800V DC stations are essential to realize its 18-minute charging capability.',
    reviewerNotes:
      'Tested across 450 miles of Autobahn, Eifel mountain switchbacks, and timed track sessions at Circuit de Spa-Francorchamps. Brake pedal modulation remains the benchmark in the EV industry.',
    testedTrim: 'Turbo S with Porsche Active Ride, 21-inch Mission E Wheels, PCCB Ceramic Brakes',
    testConditions: 'Dry tarmac, ambient temperature 19°C (66°F), Michelin Pilot Sport Cup 2 tyres',
    reviewDate: 'September 2024',
    author: EDITORIAL_AUTHORS[0],
    publicationStatus: 'published',
    heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    verifiedSpecs: {
      acceleration0to60: '2.3 seconds (Verified GPS)',
      topSpeed: '162 mph / 260 km/h (Electronically Limited)',
      testedEfficiency: '33.2 kWh/100 miles (Combined Track/Highway)',
      weight: '5,060 lbs / 2,295 kg',
    },
  },
  {
    id: 'rev_mahindra_thar_roxx',
    slug: 'mahindra-thar-roxx-ax7l-road-test-review',
    title: 'Mahindra Thar Roxx AX7L 4x4 Road & Extreme Terrain Test',
    vehicleSlug: 'mahindra-thar-roxx-ax7l',
    variant: 'AX7L 2.2L mHawk 4x4 AT',
    overallScore: 8.8,
    categoryScores: {
      exteriorDesign: 9.2,
      interiorComfort: 8.6,
      technology: 8.8,
      performance: 8.5,
      practicality: 8.9,
      safety: 9.1,
    },
    verdictSummary:
      'The Thar grows up without losing its soul. A triumphant transformation from a spartan weekend toy to a refined, family-ready off-road cruiser with 5-Star Bharat NCAP credentials.',
    strengths: [
      'Watts linkage rear suspension virtually cures traditional body-on-frame wobble',
      'Punchy 2.2L mHawk turbo-diesel paired seamlessly to smooth Aisin 6-speed auto',
      'Panoramic Skyroof and 9-speaker Harman Kardon audio feel legitimately premium',
      'Exceptional approach (41.7°), departure (36.1°), and water wading depth (650mm)',
    ],
    weaknesses: [
      'High vehicle floor requires using side step grab handles for shorter passengers',
      'Slightly heavy hydraulic-assisted steering feel during tight urban parking manoeuvres',
      'Long waiting periods in prime metro areas',
    ],
    suitableBuyerProfile:
      'Adventure-oriented families and overland tourers needing genuine off-road capability for Ladakh and Spiti passes, combined with everyday school-run refinement and highway poise.',
    realWorldConsiderations:
      'Real-world highway fuel efficiency averages 12.8–14.2 km/l, dropping to 9.5 km/l in crawling urban traffic or low-range 4x4 rock crawling. DEF (diesel exhaust fluid) tank requires top-up every ~8,000 km.',
    reviewerNotes:
      'Tested across 800 km comprising the Western Ghats ghat roads, NH48 high-speed cruising, and technical articulation pits. The Level 2 ADAS forward collision warning calibration on Indian highways is remarkably well tuned.',
    testedTrim: 'AX7L 4x4 Diesel AT with Panoramic Skyroof, Battleship Grey exterior',
    testConditions: 'Monsoon wet gravel, dry highway, heavy rain ambient 26°C',
    reviewDate: 'October 2024',
    author: EDITORIAL_AUTHORS[1],
    publicationStatus: 'published',
    heroImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    verifiedSpecs: {
      acceleration0to60: '9.8 seconds (0-100 km/h: 10.4s)',
      topSpeed: '106 mph / 170 km/h',
      testedEfficiency: '13.1 km/l (Combined Real-World)',
      weight: '4,430 lbs / 2,010 kg',
    },
  },
  {
    id: 'rev_tata_curvv_ev',
    slug: 'tata-curvv-ev-empowered-road-test-review',
    title: 'Tata Curvv.ev Empowered Plus 55 Long-Term Road Test',
    vehicleSlug: 'tata-curvv-ev-empowered',
    variant: 'Empowered Plus A 55 Long Range',
    overallScore: 8.7,
    categoryScores: {
      exteriorDesign: 9.3,
      interiorComfort: 8.5,
      technology: 8.9,
      performance: 8.4,
      practicality: 8.6,
      safety: 9.4,
    },
    verdictSummary:
      'The most compelling mass-market electric vehicle to emerge from the subcontinent. Striking coupé aesthetics meet mature highway suspension tuning and genuine 400+ km real-world range.',
    strengths: [
      'Unmistakable SUV-Coupé silhouette that turns heads at every signal',
      'Solid 55 kWh battery pack reliably returns 420 km real-world mixed range',
      '5-Star Bharat NCAP crash test rating with 6 standard airbags',
      'Segment-first powered tailgate with gesture control and 500L boot',
    ],
    weaknesses: [
      'Sloping roofline encroaches on rear passenger headroom for individuals over 6ft',
      'Front-wheel drive limits maximum traction under sudden launch pedal stomps',
      'Piano black centre console surfaces are prone to micro-scratches',
    ],
    suitableBuyerProfile:
      'Style-conscious urban professionals and eco-minded commuters seeking an eye-catching electric crossover with genuine inter-city touring capability.',
    realWorldConsiderations:
      'On Mumbai-Pune Expressway testing with climate control set to 22°C, the Curvv.ev consumed 128 Wh/km, yielding 430 km of range. 60 kW DC chargers replenished 10% to 80% in 42 minutes.',
    reviewerNotes:
      'The paddle-shifter regenerative braking controls are among the most intuitive in this class, offering true one-pedal urban driving.',
    testedTrim: 'Empowered Plus A 55 in Virtual Sunrise Blue with Arcade.ev app suite',
    testConditions: 'City stop-and-go and expressway speeds up to 120 km/h, 31°C ambient',
    reviewDate: 'September 2024',
    author: EDITORIAL_AUTHORS[1],
    publicationStatus: 'published',
    heroImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    verifiedSpecs: {
      acceleration0to60: '8.1 seconds (0-100 km/h: 8.6s)',
      topSpeed: '99 mph / 160 km/h',
      testedEfficiency: '13.2 kWh/100 km',
      weight: '3,840 lbs / 1,742 kg',
    },
  },
];

// Seed Launches with 3-Tier Verification Status
const DEFAULT_EDITORIAL_LAUNCHES: LaunchRecord[] = [
  {
    id: 'launch_tata_curvv_ev',
    vehicleName: 'Tata Curvv.ev Empowered Plus 55',
    manufacturer: 'Tata Motors',
    model: 'Curvv EV',
    variant: 'Empowered Plus A 55 Long Range',
    modelYear: 2025,
    announcementDate: 'August 7, 2024',
    marketLaunchDate: 'September 2024',
    expectedDelivery: 'Pan-India Deliveries Active',
    market: 'India Market',
    status: 'available',
    verificationStatus: 'officially_confirmed',
    powertrain: 'electric',
    category: 'SUV Coupé',
    startingPrice: 21500,
    currency: 'USD',
    headline: 'India’s Defining Mass-Market Electric SUV Coupé with 585 km Certified Range',
    summary:
      'Constructed on the dedicated acti.ev pure-electric skateboard architecture, featuring 55 kWh prismatic battery cells, 1.2C ultra-fast charging, flush door handles, and certified 5-Star Bharat NCAP safety rating.',
    sourceUrl: 'https://ev.tatamotors.com/curvv.ev',
    sourceName: 'Tata Passenger Electric Mobility Press Bureau',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    relatedVehicleSlug: 'tata-curvv-ev-empowered',
  },
  {
    id: 'launch_mahindra_thar_roxx',
    vehicleName: 'Mahindra Thar Roxx AX7L 4x4',
    manufacturer: 'Mahindra',
    model: 'Thar Roxx',
    variant: 'AX7L 4x4 Diesel AT',
    modelYear: 2025,
    announcementDate: 'August 15, 2024',
    marketLaunchDate: 'October 2024',
    expectedDelivery: 'Immediate Deliveries Underway',
    market: 'India Market',
    status: 'available',
    verificationStatus: 'officially_confirmed',
    powertrain: 'diesel',
    category: '4x4 Off-Road SUV',
    startingPrice: 24500,
    currency: 'USD',
    headline: 'Five-Door Off-Road Icon with Level 2 ADAS, Panoramic Skyroof, and Harman Kardon Audio',
    summary:
      'Built on the advanced 4G chassis with Watts linkage suspension, 2.2L mHawk turbo-diesel delivering 175 PS / 370 Nm, Level 2 ADAS suite, and certified 5-Star Bharat NCAP safety rating.',
    sourceUrl: 'https://auto.mahindra.com/suv/thar-roxx',
    sourceName: 'Mahindra Auto Official Portal',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    relatedVehicleSlug: 'mahindra-thar-roxx-ax7l',
  },
  {
    id: 'launch_porsche_taycan_turbo_gt',
    vehicleName: 'Porsche Taycan Turbo GT with Weissach Package',
    manufacturer: 'Porsche',
    model: 'Taycan',
    variant: 'Turbo GT Weissach Package',
    modelYear: 2025,
    announcementDate: 'March 11, 2024',
    marketLaunchDate: 'Summer 2024',
    expectedDelivery: 'Active Global Customer Hand-Offs',
    market: 'Global Market',
    status: 'available',
    verificationStatus: 'officially_confirmed',
    powertrain: 'electric',
    category: 'Performance EV Saloon',
    startingPrice: 230000,
    currency: 'USD',
    headline: 'Lap Record Holder at Nürburgring Nordschleife (7:07.55) and Laguna Seca',
    summary:
      'Delivering up to 1,092 hp (815 kW) in Attack Mode with silicon carbide semiconductor pulse inverters. Sprints from 0 to 60 mph in 2.1 seconds with rear seat delete.',
    sourceUrl: 'https://newsroom.porsche.com/en/2024/products/porsche-taycan-turbo-gt-35496.html',
    sourceName: 'Porsche AG Official Newsroom',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    relatedVehicleSlug: 'porsche-taycan-turbo-s',
  },
  {
    id: 'launch_bmw_m5_touring',
    vehicleName: 'BMW M5 Touring (G99)',
    manufacturer: 'BMW',
    model: 'M5',
    variant: 'Touring G99',
    modelYear: 2025,
    announcementDate: 'August 15, 2024',
    marketLaunchDate: 'November 2024',
    expectedDelivery: 'Q4 2024 (Europe) / Q1 2025 (North America)',
    market: 'Global Market',
    status: 'upcoming',
    verificationStatus: 'officially_confirmed',
    powertrain: 'hybrid',
    category: 'Performance Estate / Wagon',
    startingPrice: 121500,
    currency: 'USD',
    headline: 'Seventh Generation M5 Introduces M HYBRID V8 Powertrain (717 HP / 738 lb-ft)',
    summary:
      'Combines a 4.4-liter M TwinPower Turbo V8 with an electric motor integrated directly into the 8-speed M Steptronic transmission. First M5 Touring available in North America.',
    sourceUrl: 'https://www.press.bmwgroup.com/global/article/detail/T0444315EN/the-new-bmw-m5-touring',
    sourceName: 'BMW Group PressClub Global Release',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    relatedVehicleSlug: 'bmw-m5-touring-g99',
  },
  {
    id: 'launch_tata_sierra_ev',
    vehicleName: 'Tata Sierra EV Flagship AWD',
    manufacturer: 'Tata Motors',
    model: 'Sierra EV',
    variant: 'Gen-2 Born EV AWD',
    modelYear: 2026,
    announcementDate: 'Auto Expo Preview',
    marketLaunchDate: 'Late 2025 / Early 2026',
    expectedDelivery: 'Estimated Q1 2026',
    market: 'India & Global Showcase',
    status: 'upcoming',
    verificationStatus: 'credible_source',
    powertrain: 'electric',
    category: 'Mid-Size Electric SUV',
    startingPrice: 32000,
    currency: 'USD',
    headline: 'Iconic Alpine Glasshouse Reimagined on Pure Electric Skateboard',
    summary:
      'Reported by accredited OEM suppliers and media briefings to feature dual-motor AWD, 500+ km estimated range, lounge rear seats, and sustainable bio-based cabin materials.',
    sourceUrl: 'https://ev.tatamotors.com',
    sourceName: 'Supplier Technical Briefings & Factory Showcase',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'launch_porsche_718_electric',
    vehicleName: 'Porsche 718 Cayman & Boxster EV',
    manufacturer: 'Porsche',
    model: '718 EV',
    variant: 'Dual-Motor Mid-Engine Packaging Concept',
    modelYear: 2026,
    announcementDate: 'Not announced',
    marketLaunchDate: 'Mid 2025 Prototype Reveal',
    expectedDelivery: 'Estimated 2026',
    market: 'Global Market',
    status: 'upcoming',
    verificationStatus: 'rumoured',
    powertrain: 'electric',
    category: 'Mid-Engine Electric Sports Car',
    startingPrice: undefined, // "Not announced"
    currency: 'USD',
    headline: 'E-Core Mid-Battery Layout Preserving Lightweight Two-Door Agility',
    summary:
      'Unconfirmed industry reports and Nürburgring camouflage prototype sightings indicate an innovative vertical battery pack positioned behind the driver to preserve 982-series weight distribution.',
    sourceUrl: 'https://www.caranddriver.com',
    sourceName: 'Accredited Nürburgring Prototype Spotters & Automotive Press',
    sourceCheckedDate: 'October 2024',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
];

// Helper: Dispatch updates
function dispatchEditorialUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_editorial_updated'));
  }
}

// ==========================================
// 1. ARTICLE OPERATIONS
// ==========================================

export function getEditorialArticles(statusFilter?: PublicationStatus): Article[] {
  if (typeof window === 'undefined') return DEFAULT_ARTICLES;
  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    const articles: Article[] = raw ? JSON.parse(raw) : DEFAULT_ARTICLES;
    if (statusFilter) {
      return articles.filter((a) => a.publicationStatus === statusFilter);
    }
    return articles;
  } catch {
    return DEFAULT_ARTICLES;
  }
}

export function getPublicArticles(): Article[] {
  return getEditorialArticles('published');
}

export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getEditorialArticles();
  return articles.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
}

export function getArticleById(id: string): Article | undefined {
  const articles = getEditorialArticles();
  return articles.find((a) => a.id === id);
}

export function saveEditorialArticle(article: Article): void {
  if (typeof window === 'undefined') return;
  const articles = getEditorialArticles();
  const existingIndex = articles.findIndex((a) => a.id === article.id);

  if (existingIndex >= 0) {
    articles[existingIndex] = {
      ...article,
      updatedAt: new Date().toISOString(),
    };
    logAdminActivity('UPDATE', 'article', article.id, article.title, `Updated article [${article.title}]`);
  } else {
    articles.unshift({
      ...article,
      publishedAt: article.publishedAt || new Date().toISOString(),
    });
    logAdminActivity('CREATE', 'article', article.id, article.title, `Authored new article [${article.title}]`);
  }

  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  dispatchEditorialUpdate();
}

export function deleteEditorialArticle(id: string): void {
  if (typeof window === 'undefined') return;
  const articles = getEditorialArticles();
  const target = articles.find((a) => a.id === id);
  const filtered = articles.filter((a) => a.id !== id);
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(filtered));
  if (target) {
    logAdminActivity('DELETE', 'article', id, target.title, `Deleted article [${target.title}]`);
  }
  dispatchEditorialUpdate();
}

export function setArticleStatus(id: string, status: PublicationStatus): void {
  const article = getArticleById(id);
  if (!article) return;
  article.publicationStatus = status;
  article.updatedAt = new Date().toISOString();
  saveEditorialArticle(article);
}

// ==========================================
// 2. CAR REVIEWS OPERATIONS
// ==========================================

export function getCarReviews(statusFilter?: PublicationStatus): CarReview[] {
  if (typeof window === 'undefined') return DEFAULT_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const reviews: CarReview[] = raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
    if (statusFilter) {
      return reviews.filter((r) => r.publicationStatus === statusFilter);
    }
    return reviews;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

export function getPublicReviews(): CarReview[] {
  return getCarReviews('published');
}

export function getReviewBySlug(slug: string): CarReview | undefined {
  const reviews = getCarReviews();
  return reviews.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
}

export function getReviewByVehicleSlug(vehicleSlug: string): CarReview | undefined {
  const reviews = getCarReviews();
  return reviews.find((r) => r.vehicleSlug.toLowerCase() === vehicleSlug.toLowerCase());
}

export function saveCarReview(review: CarReview): void {
  if (typeof window === 'undefined') return;
  const reviews = getCarReviews();
  const existingIndex = reviews.findIndex((r) => r.id === review.id);

  if (existingIndex >= 0) {
    reviews[existingIndex] = review;
    logAdminActivity('UPDATE', 'review', review.id, review.title, `Updated road test review [${review.title}]`);
  } else {
    reviews.unshift(review);
    logAdminActivity('CREATE', 'review', review.id, review.title, `Published road test review [${review.title}]`);
  }

  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  dispatchEditorialUpdate();
}

export function deleteCarReview(id: string): void {
  if (typeof window === 'undefined') return;
  const reviews = getCarReviews();
  const target = reviews.find((r) => r.id === id);
  const filtered = reviews.filter((r) => r.id !== id);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
  if (target) {
    logAdminActivity('DELETE', 'review', id, target.title, `Deleted road test review [${target.title}]`);
  }
  dispatchEditorialUpdate();
}

// ==========================================
// 3. LAUNCH RECORD OPERATIONS (3-TIER VERIFIED)
// ==========================================

export function getEditorialLaunches(
  filterStatus?: string,
  filterVerification?: VerificationStatus
): LaunchRecord[] {
  if (typeof window === 'undefined') return DEFAULT_EDITORIAL_LAUNCHES;
  try {
    const raw = localStorage.getItem(LAUNCHES_STORAGE_KEY);
    let launches: LaunchRecord[] = raw ? JSON.parse(raw) : DEFAULT_EDITORIAL_LAUNCHES;
    if (filterStatus && filterStatus !== 'all') {
      launches = launches.filter((l) => l.status === filterStatus);
    }
    if (filterVerification) {
      launches = launches.filter((l) => l.verificationStatus === filterVerification);
    }
    return launches;
  } catch {
    return DEFAULT_EDITORIAL_LAUNCHES;
  }
}

export function saveEditorialLaunch(launch: LaunchRecord): void {
  if (typeof window === 'undefined') return;
  const launches = getEditorialLaunches();
  const existingIndex = launches.findIndex((l) => l.id === launch.id);

  if (existingIndex >= 0) {
    launches[existingIndex] = launch;
    logAdminActivity('UPDATE', 'launch', launch.id, launch.vehicleName, `Updated launch record [${launch.vehicleName}]`);
  } else {
    launches.unshift(launch);
    logAdminActivity('CREATE', 'launch', launch.id, launch.vehicleName, `Added launch premiere [${launch.vehicleName}]`);
  }

  localStorage.setItem(LAUNCHES_STORAGE_KEY, JSON.stringify(launches));
  dispatchEditorialUpdate();
}

export function deleteEditorialLaunch(id: string): void {
  if (typeof window === 'undefined') return;
  const launches = getEditorialLaunches();
  const target = launches.find((l) => l.id === id);
  const filtered = launches.filter((l) => l.id !== id);
  localStorage.setItem(LAUNCHES_STORAGE_KEY, JSON.stringify(filtered));
  if (target) {
    logAdminActivity('DELETE', 'launch', id, target.vehicleName, `Deleted launch premiere [${target.vehicleName}]`);
  }
  dispatchEditorialUpdate();
}

// ==========================================
// 4. USER READING LIST & BOOKMARKS
// ==========================================

export function getUserReadingList(userId: string): ReadingListItem[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(READING_LIST_STORAGE_KEY);
    const allItems: ReadingListItem[] = raw ? JSON.parse(raw) : [];
    return allItems.filter((item) => item.userId === userId);
  } catch {
    return [];
  }
}

export function isArticleBookmarked(userId: string, articleId: string): boolean {
  if (!userId || !articleId) return false;
  const list = getUserReadingList(userId);
  return list.some((item) => item.articleId === articleId);
}

export function toggleBookmarkArticle(userId: string, articleId: string): boolean {
  if (typeof window === 'undefined' || !userId || !articleId) return false;
  try {
    const raw = localStorage.getItem(READING_LIST_STORAGE_KEY);
    let allItems: ReadingListItem[] = raw ? JSON.parse(raw) : [];
    const exists = allItems.some((item) => item.userId === userId && item.articleId === articleId);

    if (exists) {
      allItems = allItems.filter((item) => !(item.userId === userId && item.articleId === articleId));
      localStorage.setItem(READING_LIST_STORAGE_KEY, JSON.stringify(allItems));
      dispatchEditorialUpdate();
      return false; // Removed
    } else {
      allItems.unshift({
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        articleId,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(READING_LIST_STORAGE_KEY, JSON.stringify(allItems));
      dispatchEditorialUpdate();
      return true; // Added
    }
  } catch {
    return false;
  }
}

// Helper: Filter articles by category or tag
export function filterArticlesByCategory(category: ArticleCategory): Article[] {
  const articles = getPublicArticles();
  if (category === 'all') return articles;
  return articles.filter((a) => a.category === category);
}

// Helper: Search articles
export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase().trim();
  if (!q) return getPublicArticles();
  return getPublicArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.author.name.toLowerCase().includes(q)
  );
}
