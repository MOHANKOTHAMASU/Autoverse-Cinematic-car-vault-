// AutoVerse Stage 14: Centralized Community, Owner Reviews, Ratings & Verification Store
// Manages Owner Reviews, Aggregated Ratings, Verified Ownership, Discussions, Helpful Votes & Moderation

import type {
  OwnerReview,
  VehicleDiscussion,
  DiscussionReply,
  HelpfulVote,
  SavedCommunityItem,
  ContentReport,
  OwnershipVerificationRequest,
  VehicleCommunitySummary,
  CommunityFilterOptions,
  ReportReason,
  DocumentType,
} from '../types/community';
import { VEHICLES } from '../data/vehicles.ts';
import { logAdminActivity } from './adminStore.ts';

// Storage Keys
const REVIEWS_KEY = 'autoverse_community_reviews_db';
const DISCUSSIONS_KEY = 'autoverse_community_discussions_db';
const REPLIES_KEY = 'autoverse_community_replies_db';
const VOTES_KEY = 'autoverse_community_votes_db';
const SAVED_KEY = 'autoverse_community_saved_db';
const REPORTS_KEY = 'autoverse_community_reports_db';
const VERIFICATIONS_KEY = 'autoverse_community_verifications_db';
const VERSION_KEY = 'autoverse_community_store_version';
const CURRENT_VERSION = 'v14_community_engine_1.0';

// Helper: Mask VIN for public and client privacy (Keep first 8 chars and last 4, mask middle)
export function maskVin(vin: string): string {
  const clean = vin.trim().toUpperCase();
  if (clean.length < 8) return 'VIN-VERIFIED-PRIVATE';
  return `${clean.slice(0, 6)}*****${clean.slice(-4)}`;
}

// ==========================================
// SEED DATA FOR COMMUNITY ENGINE
// ==========================================

const SEED_REVIEWS: OwnerReview[] = [
  {
    id: 'rev_taycan_01',
    vehicleSlug: 'porsche-taycan-turbo-s',
    vehicleModel: 'Taycan Turbo S',
    vehicleBrand: 'Porsche',
    vehicleVariant: 'Turbo S Performance Battery Plus',
    authorId: 'usr_porsche_drvr',
    authorName: 'Julian Sterling',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    overallRating: 4.9,
    categoryRatings: {
      comfort: 4.8,
      performance: 5.0,
      reliability: 4.7,
      practicality: 4.2,
      technology: 4.9,
      valueForMoney: 4.3,
    },
    ownershipDuration: '1_to_2_years',
    drivingConditions: 'mixed_daily',
    approximateMileage: '18,400 miles',
    title: 'The benchmark electric grand tourer: Mind-bending launch control with zero thermal fatigue',
    writtenExperience:
      'Having owned the Taycan Turbo S for 18 months through both severe winters and summer track days, it has redefined my expectations of EV dynamics. The 800-volt architecture consistently pulls 270 kW charging curves, meaning 5% to 80% takes barely 21 minutes on high-speed IONITY chargers. The rear-axle steering and active anti-roll stabilization make a 2.3-ton machine handle like a Cayman GT4 in tight sweepers.',
    pros: [
      'Sub-2.4s repeatable launch control without battery throttling',
      '800V fast-charge curve sustains over 250 kW effortlessly',
      'Class-leading chassis poise and steering communication',
      'Impeccable Stuttgart interior fit and finish',
    ],
    cons: [
      'Rear passenger foot garage is slightly snug for 6ft+ adults',
      'Optional ceramic composite brakes can be grabby in crawling traffic',
      'Porsche Connect smartphone app occasionally drops pre-conditioning pairing',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '2.8 mi/kWh mixed (equivalent to ~95 MPGe)',
      annualMaintenanceCost: '$480 (Scheduled 20k inspection and brake fluid purge)',
      insuranceExperience: '$2,400/year through Porsche Auto Insurance',
      unexpectedRepairs: 'None to date. Flawless high-voltage contactor reliability.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: 'WP0AB2Y1*****3918',
      documentType: 'registration_certificate',
      submittedAt: '2024-03-12T10:00:00Z',
      reviewedAt: '2024-03-13T14:30:00Z',
      reviewedBy: 'AutoVerse Concierge Team',
      verifiedBadgeExplanation: 'Verified Owner: Vehicle registration title independently audited by AutoVerse Concierge.',
    },
    status: 'published',
    helpfulCount: 42,
    notHelpfulCount: 1,
    reportCount: 0,
    createdAt: '2024-03-15T10:20:00Z',
    updatedAt: '2024-03-15T10:20:00Z',
  },
  {
    id: 'rev_plaid_01',
    vehicleSlug: 'tesla-model-s-plaid',
    vehicleModel: 'Model S Plaid',
    vehicleBrand: 'Tesla',
    vehicleVariant: 'Tri-Motor All-Wheel Drive',
    authorId: 'usr_plaid_pilot',
    authorName: 'Marcus Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    overallRating: 4.6,
    categoryRatings: {
      comfort: 4.4,
      performance: 5.0,
      reliability: 4.1,
      practicality: 4.8,
      technology: 4.9,
      valueForMoney: 4.7,
    },
    ownershipDuration: '2_to_5_years',
    drivingConditions: 'highway_cruiser',
    approximateMileage: '34,000 miles',
    title: 'Hypercar velocity disguised as a family liftback with massive cargo capacity',
    writtenExperience:
      'The acceleration never gets old. 1,020 hp on tap turns passing semi-trucks into instantaneous teleports. The liftback hatchback swallowed our luggage and baby stroller effortlessly on coast-to-coast trips. Autopilot and the Supercharger network make 600-mile journeys completely stress-free. The yolk steering wheel required about two weeks of muscle memory acclimation.',
    pros: [
      'Unmatched tri-motor acceleration in any gear',
      'Massive rear cargo hatch and generous front trunk',
      'Unrivaled Supercharging network density and plug-and-play ease',
      'Infotainment gaming rig keeps kids entertained during charges',
    ],
    cons: [
      'Interior trim rattles near B-pillar after 20,000 miles',
      'Track package should be standard for high-speed thermal braking',
      'Service appointment wait times can exceed two weeks in metropolitan areas',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '310 Wh/mi highway (~108 MPGe)',
      annualMaintenanceCost: '$210 (Tire rotations and cabin HEPA filter)',
      insuranceExperience: '$2,100/year',
      unexpectedRepairs: 'Front half-shaft seal replaced under warranty at 14,000 mi.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: '5YJSA1E6*****8812',
      documentType: 'purchase_invoice',
      submittedAt: '2024-01-20T08:00:00Z',
      reviewedAt: '2024-01-21T11:00:00Z',
      reviewedBy: 'AutoVerse Concierge Team',
      verifiedBadgeExplanation: 'Verified Owner: Vehicle bill of sale audited by AutoVerse Concierge.',
    },
    status: 'published',
    helpfulCount: 38,
    notHelpfulCount: 3,
    reportCount: 0,
    createdAt: '2024-02-01T15:30:00Z',
    updatedAt: '2024-02-01T15:30:00Z',
  },
  {
    id: 'rev_harrier_01',
    vehicleSlug: 'tata-harrier',
    vehicleModel: 'Harrier',
    vehicleBrand: 'Tata Motors',
    vehicleVariant: 'Fearless Plus Dark Edition AT',
    authorId: 'usr_rohit_patel',
    authorName: 'Rohit Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    overallRating: 4.7,
    categoryRatings: {
      comfort: 4.8,
      performance: 4.5,
      reliability: 4.4,
      practicality: 4.9,
      technology: 4.6,
      valueForMoney: 4.9,
    },
    ownershipDuration: '6_to_12_months',
    drivingConditions: 'mixed_daily',
    approximateMileage: '12,800 km',
    title: 'Monstrous road presence, supreme ride quality over bad tarmac, and effortless highway cruising',
    writtenExperience:
      'The OMEGArc platform derived from Land Rover D8 underpinnings gives the Harrier an impenetrable vault-like feeling on monsoon highway trips. The 170 HP 2.0L Kryotec diesel paired with the 6-speed torque converter is tuned for long-distance composure. Ventilated seats and the 360-degree camera with blind-spot monitor make city maneuvering much easier than its muscular dimensions suggest.',
    pros: [
      'Phenomenal suspension compliance that flattens broken asphalt and craters',
      'Commanding elevated seating position with supreme peripheral vision',
      'JBL 10-speaker acoustic system with punchy subwoofer acoustics',
      'Generous second-row legroom with aircraft-style rear sunblinds',
    ],
    cons: [
      'Hydraulic-like steering feels heavy in tight underground parking bays',
      'Infotainment UI wireless CarPlay can occasionally lag on initial boot',
      'Diesel engine has characteristic low-frequency hum under hard acceleration',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '13.4 km/l in city traffic, 17.8 km/l highway cruise',
      annualMaintenanceCost: '₹11,500 (10k service including synthetic oil and filters)',
      insuranceExperience: '₹46,000/year zero-dep policy',
      unexpectedRepairs: 'None. Smooth warranty service.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: 'MAT62137*****4019',
      documentType: 'registration_certificate',
      submittedAt: '2024-05-10T12:00:00Z',
      reviewedAt: '2024-05-11T09:15:00Z',
      reviewedBy: 'AutoVerse Regional Desk',
      verifiedBadgeExplanation: 'Verified Owner: Vahan RC registration verified with vehicle chassis number.',
    },
    status: 'published',
    helpfulCount: 29,
    notHelpfulCount: 1,
    reportCount: 0,
    createdAt: '2024-05-15T09:40:00Z',
    updatedAt: '2024-05-15T09:40:00Z',
  },
  {
    id: 'rev_curvv_01',
    vehicleSlug: 'tata-curvv-ev',
    vehicleModel: 'Curvv EV',
    vehicleBrand: 'Tata Motors',
    vehicleVariant: 'Empowered Plus 55 kWh',
    authorId: 'usr_ananya_sharma',
    authorName: 'Ananya Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    overallRating: 4.8,
    categoryRatings: {
      comfort: 4.7,
      performance: 4.6,
      reliability: 4.7,
      practicality: 4.8,
      technology: 4.9,
      valueForMoney: 4.8,
    },
    ownershipDuration: 'less_than_6_months',
    drivingConditions: 'city_commuter',
    approximateMileage: '4,200 km',
    title: 'Futuristic SUV coupe styling with real-world 400+ km range and V2L charging capability',
    writtenExperience:
      'The Curvv EV draws admiring looks at every traffic light. The coupe roofline does not compromise boot space thanks to the clever 500-liter deep cargo deck. On my daily 60 km Pune-Mumbai expressway commute, the 55 kWh battery returns 415 km real-world range with climate control set to 22C. The Vehicle-to-Load (V2L) port powered our campsite espresso machine on our weekend Lonavala trip!',
    pros: [
      'Striking aerodynamic coupe silhouette with flush door handles',
      'Consistent 400+ km real-world range on highway and ring road loops',
      'Vehicle-to-Load (V2L) and Vehicle-to-Vehicle (V2V) bi-directional charging',
      'Segment-leading Level 2 ADAS with adaptive cruise control that works smoothly',
    ],
    cons: [
      'Sloping rear roofline reduces rear headroom for passengers above 6ft 1in',
      'Public fast-charging network peak speeds cap around 70 kW',
      'Piano black center console attracts dust and micro-scratches easily',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '13.2 kWh / 100 km (~₹1.4 per km on home solar tariff)',
      annualMaintenanceCost: '₹3,500 estimated annual EV inspection',
      insuranceExperience: '₹38,000/year',
      unexpectedRepairs: 'None. Zero issues on Gen-2 Acti.ev skateboard platform.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: 'MAT62541*****9021',
      documentType: 'insurance_policy',
      submittedAt: '2024-08-01T14:00:00Z',
      reviewedAt: '2024-08-02T10:00:00Z',
      reviewedBy: 'AutoVerse Regional Desk',
      verifiedBadgeExplanation: 'Verified Owner: Vehicle insurance policy validated against owner name.',
    },
    status: 'published',
    helpfulCount: 34,
    notHelpfulCount: 0,
    reportCount: 0,
    createdAt: '2024-08-10T11:15:00Z',
    updatedAt: '2024-08-10T11:15:00Z',
  },
  {
    id: 'rev_roxx_01',
    vehicleSlug: 'mahindra-thar-roxx',
    vehicleModel: 'Thar Roxx',
    vehicleBrand: 'Mahindra',
    vehicleVariant: 'AX7L 4x4 Diesel AT',
    authorId: 'usr_vikram_singh',
    authorName: 'Vikramaditya Singh',
    overallRating: 4.8,
    categoryRatings: {
      comfort: 4.6,
      performance: 4.8,
      reliability: 4.7,
      practicality: 4.8,
      technology: 4.7,
      valueForMoney: 4.9,
    },
    ownershipDuration: 'less_than_6_months',
    drivingConditions: 'rural_offroad',
    approximateMileage: '5,800 km',
    title: 'The five-door evolution Thar fans dreamed of: Authentic 4x4 ruggedness with luxury saloon manners',
    writtenExperience:
      'The Thar Roxx solves every practical limitation of the 3-door Thar. The lengthened wheelbase and multi-link rear suspension with Watt linkage eliminate the high-speed vertical pitch completely. The panoramic Skyroof, white leatherette upholstery, and Harmon Kardon 9-speaker system feel genuinely premium. In the sands of Rajasthan, the mechanical locking rear differential and electronic terrain modes crawled out of dunes without dropping tire pressure.',
    pros: [
      'Proper 5-door usability with spacious rear seats and huge boot',
      'mHawk 2.2L diesel puts out 175 HP / 370 Nm with immense low-end torque',
      'Electronic brake-locking front diff & mechanical rear diff crawl over anything',
      'Level 2 ADAS calibration is well suited to unpredictable highway situations',
    ],
    cons: [
      'White upholstery requires diligent cleaning after dusty trail drives',
      'Noticeable wind noise past 125 km/h due to upright windscreen geometry',
      'High side step climb requires elderly passengers to use the grab handles',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '10.8 km/l city, 14.5 km/l cruising at 100 km/h',
      annualMaintenanceCost: '₹9,800 first 5k km service',
      insuranceExperience: '₹52,000/year bumper-to-bumper with engine protector',
      unexpectedRepairs: 'None. Tank-like ladder-frame build.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: 'MA1TA2TH*****7734',
      documentType: 'registration_certificate',
      submittedAt: '2024-09-01T15:00:00Z',
      reviewedAt: '2024-09-02T11:30:00Z',
      reviewedBy: 'AutoVerse Concierge Team',
      verifiedBadgeExplanation: 'Verified Owner: Vehicle registration verified with Indian Ministry of Transport.',
    },
    status: 'published',
    helpfulCount: 51,
    notHelpfulCount: 2,
    reportCount: 0,
    createdAt: '2024-09-05T08:45:00Z',
    updatedAt: '2024-09-05T08:45:00Z',
  },
  {
    id: 'rev_ioniq_01',
    vehicleSlug: 'hyundai-ioniq-5',
    vehicleModel: 'Ioniq 5',
    vehicleBrand: 'Hyundai',
    vehicleVariant: 'Long Range AWD 72.6 kWh',
    authorId: 'usr_elena_rostova',
    authorName: 'Elena Rostova',
    overallRating: 4.9,
    categoryRatings: {
      comfort: 5.0,
      performance: 4.7,
      reliability: 4.9,
      practicality: 5.0,
      technology: 4.8,
      valueForMoney: 4.8,
    },
    ownershipDuration: '1_to_2_years',
    drivingConditions: 'mixed_daily',
    approximateMileage: '22,000 miles',
    title: 'Lounge-like cabin architecture, phenomenal 800V fast charging, and retro-modern styling',
    writtenExperience:
      'The 3,000 mm wheelbase creates more passenger cabin legroom than most luxury full-size SUVs. The sliding Universal Island center console and reclining relaxation front seats allow comfortable working on a laptop while charging. 10% to 80% charging in 18 minutes on 350 kW Electrify America stations makes weekend getaways effortless.',
    pros: [
      'Fastest charging in its price class with ultra-flat 800V charge profile',
      'Living room style airy cabin with flat floor and slide-out glove drawer',
      'Exceptional thermal management preserves winter battery efficiency',
      'Pixel LED lighting and geometric body creases look like a 2030 concept car',
    ],
    cons: [
      'Missing rear windscreen wiper in pre-facelift models',
      'Turning circle is wider than average due to 3-meter wheelbase',
      'Built-in route navigation planner lacks live dynamic stall occupancy data',
    ],
    ownershipCostObservations: {
      fuelEconomyObserved: '3.4 mi/kWh in city, 2.9 mi/kWh highway cruise',
      annualMaintenanceCost: '$160 (Cabin air filter & tire rotations)',
      insuranceExperience: '$1,650/year',
      unexpectedRepairs: 'ICCU software update performed under complimentary service recall.',
    },
    verificationStatus: 'verified',
    verificationDetails: {
      vinMasked: 'KM8KRDA2*****5120',
      documentType: 'purchase_invoice',
      submittedAt: '2024-02-14T09:00:00Z',
      reviewedAt: '2024-02-15T10:15:00Z',
      reviewedBy: 'AutoVerse Concierge Team',
      verifiedBadgeExplanation: 'Verified Owner: Vehicle invoice and warranty registration confirmed.',
    },
    status: 'published',
    helpfulCount: 31,
    notHelpfulCount: 1,
    reportCount: 0,
    createdAt: '2024-02-20T14:10:00Z',
    updatedAt: '2024-02-20T14:10:00Z',
  },
];

const SEED_DISCUSSIONS: VehicleDiscussion[] = [
  {
    id: 'disc_taycan_battery',
    vehicleSlug: 'porsche-taycan-turbo-s',
    vehicleModel: 'Taycan Turbo S',
    vehicleBrand: 'Porsche',
    authorId: 'usr_porsche_drvr',
    authorName: 'Julian Sterling',
    isVerifiedOwner: true,
    title: 'Winter battery pre-conditioning tips & maximum DC fast charge curve optimization',
    content:
      'Wanted to share observations on how to achieve the full 270 kW peak rate on the Taycan during sub-freezing temperatures. Setting the DC charger as a waypoint in Porsche PCM navigation activates aggressive high-voltage coolant loop pre-heating approximately 25 minutes prior to arrival. If battery temp reaches 32°C (89°F), the charge session sustains above 200 kW past 55% SoC. Who else tracks battery telemetry via OBD2?',
    category: 'range_efficiency',
    tags: ['battery-health', '800v-charging', 'winter-driving', 'telemetry'],
    status: 'active',
    helpfulVotes: 24,
    replyCount: 3,
    reportCount: 0,
    lastActivityAt: '2024-10-18T16:20:00Z',
    createdAt: '2024-10-15T12:00:00Z',
    updatedAt: '2024-10-18T16:20:00Z',
  },
  {
    id: 'disc_roxx_offroad',
    vehicleSlug: 'mahindra-thar-roxx',
    vehicleModel: 'Thar Roxx',
    vehicleBrand: 'Mahindra',
    authorId: 'usr_vikram_singh',
    authorName: 'Vikramaditya Singh',
    isVerifiedOwner: true,
    title: 'Best tire pressure settings for rock crawling vs deep sand on the AX7L 4x4',
    content:
      'We tested the factory 19-inch alloys vs 18-inch steel wheels on Ladakh trails. With 18-inch 265/65R18 all-terrains aired down to 18 PSI, the contact patch expands significantly and sidewall flex absorbs jagged riverbed rocks with zero wheel rash. Would love to hear if anyone is considering a 2-inch Old Man Emu lift kit.',
    category: 'modifications',
    tags: ['offroad-setup', 'tire-pressure', 'rock-crawling', 'overland'],
    status: 'active',
    helpfulVotes: 19,
    replyCount: 2,
    reportCount: 0,
    lastActivityAt: '2024-10-20T11:45:00Z',
    createdAt: '2024-10-18T09:30:00Z',
    updatedAt: '2024-10-20T11:45:00Z',
  },
  {
    id: 'disc_curvv_v2l',
    vehicleSlug: 'tata-curvv-ev',
    vehicleModel: 'Curvv EV',
    vehicleBrand: 'Tata Motors',
    authorId: 'usr_ananya_sharma',
    authorName: 'Ananya Sharma',
    isVerifiedOwner: true,
    title: 'Vehicle-to-Load adapter compatibility and emergency home power backup setup',
    content:
      'Can confirm the Curvv EV official V2L 3-pin adapter delivers a steady 3.3 kW output. During a recent scheduled grid maintenance outage in our sector, we powered our home refrigerator, Wi-Fi mesh routers, and workstation setup for 9 continuous hours. The battery dropped only 14%. Truly transformative for EV ownership.',
    category: 'general',
    tags: ['v2l', 'home-backup', 'acti-ev', 'efficiency'],
    status: 'active',
    helpfulVotes: 32,
    replyCount: 4,
    reportCount: 0,
    lastActivityAt: '2024-10-22T14:10:00Z',
    createdAt: '2024-10-19T14:00:00Z',
    updatedAt: '2024-10-22T14:10:00Z',
  },
];

const SEED_REPLIES: DiscussionReply[] = [
  {
    id: 'rep_01',
    discussionId: 'disc_taycan_battery',
    authorId: 'usr_drvr_mark',
    authorName: 'Markus Lindholm',
    isVerifiedOwner: true,
    content:
      'Can confirm! If you leave it to manual arrival without PCM navigation preconditioning, the charge starts at 90 kW and takes 15 minutes just to warm the cells. Navigation pre-conditioning is mandatory below 5°C.',
    helpfulVotes: 12,
    reportCount: 0,
    status: 'active',
    createdAt: '2024-10-16T08:15:00Z',
    updatedAt: '2024-10-16T08:15:00Z',
  },
  {
    id: 'rep_02',
    discussionId: 'disc_curvv_v2l',
    authorId: 'usr_rajiv_m',
    authorName: 'Rajiv Menon',
    isVerifiedOwner: false,
    content:
      'Did you need an external surge suppressor for the sensitive computer monitors, or does the onboard inverter produce pure sine wave output?',
    helpfulVotes: 6,
    reportCount: 0,
    status: 'active',
    createdAt: '2024-10-20T10:05:00Z',
    updatedAt: '2024-10-20T10:05:00Z',
  },
  {
    id: 'rep_03',
    discussionId: 'disc_curvv_v2l',
    authorId: 'usr_ananya_sharma',
    authorName: 'Ananya Sharma',
    isVerifiedOwner: true,
    content:
      'It produces a clean pure sine wave with less than 3% THD. My oscilloscope showed steady 230V @ 50Hz, perfectly safe for studio monitors and electronics!',
    helpfulVotes: 18,
    reportCount: 0,
    status: 'active',
    createdAt: '2024-10-20T13:40:00Z',
    updatedAt: '2024-10-20T13:40:00Z',
  },
];

const SEED_VERIFICATION_REQUESTS: OwnershipVerificationRequest[] = [
  {
    id: 'ver_req_demo_01',
    userId: 'usr_driver_77',
    userFullName: 'Devon Hughes',
    userEmail: 'devon.hughes@example.com',
    vehicleSlug: 'bmw-m4-competition',
    vehicleModel: 'BMW M4 Competition',
    documentType: 'registration_certificate',
    vinMasked: 'WBS43AZ0*****8219',
    proofReference: 'REF_AUDIT_2024_BMW_9182',
    status: 'pending',
    reviewerNotes: 'Official state title document submitted. Awaiting concierge chassis match.',
    createdAt: '2024-10-21T09:30:00Z',
  },
  {
    id: 'ver_req_demo_02',
    userId: 'usr_driver_88',
    userFullName: 'Priya Kulkarni',
    userEmail: 'priya.k@example.com',
    vehicleSlug: 'tata-safari',
    vehicleModel: 'Tata Safari',
    documentType: 'insurance_policy',
    vinMasked: 'MAT62199*****1142',
    proofReference: 'REF_AUDIT_2024_SAFARI_3310',
    status: 'pending',
    reviewerNotes: 'Comprehensive insurance endorsement with vehicle engine and chassis details.',
    createdAt: '2024-10-22T14:20:00Z',
  },
];

const SEED_REPORTS: ContentReport[] = [
  {
    id: 'rep_flag_01',
    reporterId: 'usr_community_mod',
    reporterName: 'Community Watchdog',
    targetType: 'discussion',
    targetId: 'disc_taycan_battery',
    targetTitle: 'Winter battery pre-conditioning tips',
    vehicleSlug: 'porsche-taycan-turbo-s',
    reason: 'spam',
    details: 'User posted an unsolicited third-party OBD dongle affiliate link in discussion reply.',
    status: 'pending',
    createdAt: '2024-10-23T11:00:00Z',
  },
];

// ==========================================
// STORE INITIALIZATION & ACCESSORS
// ==========================================

function initCommunityStore() {
  if (typeof window === 'undefined') return;
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      if (!localStorage.getItem(REVIEWS_KEY)) {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(SEED_REVIEWS));
      }
      if (!localStorage.getItem(DISCUSSIONS_KEY)) {
        localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(SEED_DISCUSSIONS));
      }
      if (!localStorage.getItem(REPLIES_KEY)) {
        localStorage.setItem(REPLIES_KEY, JSON.stringify(SEED_REPLIES));
      }
      if (!localStorage.getItem(VERIFICATIONS_KEY)) {
        localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(SEED_VERIFICATION_REQUESTS));
      }
      if (!localStorage.getItem(REPORTS_KEY)) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(SEED_REPORTS));
      }
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  } catch (err) {
    console.error('Failed to init community store:', err);
  }
}

// Ensure initialized on module load
initCommunityStore();

export function getAllReviews(): OwnerReview[] {
  if (typeof window === 'undefined') return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_REVIEWS;
  }
}

export function saveAllReviews(reviews: OwnerReview[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('autoverse_reviews_updated'));
  } catch (err) {
    console.error('Failed to save reviews:', err);
  }
}

export function getPublicReviews(options?: CommunityFilterOptions): OwnerReview[] {
  const all = getAllReviews().filter((r) => r.status === 'published');
  if (!options) return all;

  return all.filter((rev) => {
    // Search Query
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      const matchText = `${rev.vehicleBrand} ${rev.vehicleModel} ${rev.vehicleVariant} ${rev.title} ${rev.writtenExperience} ${rev.pros.join(' ')} ${rev.cons.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Vehicle Slug
    if (options.vehicleSlug && rev.vehicleSlug !== options.vehicleSlug) {
      return false;
    }

    // Brand
    if (options.brand && options.brand !== 'all') {
      if (rev.vehicleBrand.toLowerCase() !== options.brand.toLowerCase()) return false;
    }

    // Ownership Duration
    if (options.ownershipDuration && options.ownershipDuration !== 'all') {
      if (rev.ownershipDuration !== options.ownershipDuration) return false;
    }

    // Minimum Rating
    if (options.minRating && options.minRating > 0) {
      if (rev.overallRating < options.minRating) return false;
    }

    // Verified Owner Only
    if (options.verifiedOnly && rev.verificationStatus !== 'verified') {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (options.sortBy === 'highest_rated') return b.overallRating - a.overallRating;
    if (options.sortBy === 'most_helpful') return b.helpfulCount - a.helpfulCount;
    if (options.sortBy === 'longest_ownership') {
      const durationWeight: Record<string, number> = {
        '5_plus_years': 5,
        '2_to_5_years': 4,
        '1_to_2_years': 3,
        '6_to_12_months': 2,
        'less_than_6_months': 1,
      };
      return (durationWeight[b.ownershipDuration] || 0) - (durationWeight[a.ownershipDuration] || 0);
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getReviewById(id: string): OwnerReview | null {
  const reviews = getAllReviews();
  return reviews.find((r) => r.id === id) || null;
}

export function getReviewsByVehicle(vehicleSlug: string): OwnerReview[] {
  return getPublicReviews({ vehicleSlug });
}

export function getReviewsByAuthor(authorId: string): OwnerReview[] {
  return getAllReviews().filter((r) => r.authorId === authorId && r.status !== 'deleted');
}

// ==========================================
// RATING AGGREGATION & COMMUNITY SUMMARY
// ==========================================

export function getVehicleCommunitySummary(vehicleSlug: string): VehicleCommunitySummary {
  const reviews = getPublicReviews({ vehicleSlug });
  const discussions = getDiscussions(vehicleSlug);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const catSums = { comfort: 0, performance: 0, reliability: 0, practicality: 0, technology: 0, valueForMoney: 0 };
  const catCounts = { comfort: 0, performance: 0, reliability: 0, practicality: 0, technology: 0, valueForMoney: 0 };
  let verifiedCount = 0;
  let totalRatingSum = 0;

  const proFrequency: Record<string, number> = {};
  const conFrequency: Record<string, number> = {};

  reviews.forEach((r) => {
    totalRatingSum += r.overallRating;
    const starBucket = Math.min(5, Math.max(1, Math.round(r.overallRating))) as 1 | 2 | 3 | 4 | 5;
    distribution[starBucket] = (distribution[starBucket] || 0) + 1;

    if (r.verificationStatus === 'verified') {
      verifiedCount++;
    }

    if (r.categoryRatings) {
      if (r.categoryRatings.comfort) {
        catSums.comfort += r.categoryRatings.comfort;
        catCounts.comfort++;
      }
      if (r.categoryRatings.performance) {
        catSums.performance += r.categoryRatings.performance;
        catCounts.performance++;
      }
      if (r.categoryRatings.reliability) {
        catSums.reliability += r.categoryRatings.reliability;
        catCounts.reliability++;
      }
      if (r.categoryRatings.practicality) {
        catSums.practicality += r.categoryRatings.practicality;
        catCounts.practicality++;
      }
      if (r.categoryRatings.technology) {
        catSums.technology += r.categoryRatings.technology;
        catCounts.technology++;
      }
      if (r.categoryRatings.valueForMoney) {
        catSums.valueForMoney += r.categoryRatings.valueForMoney;
        catCounts.valueForMoney++;
      }
    }

    r.pros?.forEach((p) => {
      const clean = p.trim();
      if (clean) proFrequency[clean] = (proFrequency[clean] || 0) + 1;
    });

    r.cons?.forEach((c) => {
      const clean = c.trim();
      if (clean) conFrequency[clean] = (conFrequency[clean] || 0) + 1;
    });
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

  const categoryAverages = {
    comfort: catCounts.comfort > 0 ? Number((catSums.comfort / catCounts.comfort).toFixed(1)) : 0,
    performance: catCounts.performance > 0 ? Number((catSums.performance / catCounts.performance).toFixed(1)) : 0,
    reliability: catCounts.reliability > 0 ? Number((catSums.reliability / catCounts.reliability).toFixed(1)) : 0,
    practicality: catCounts.practicality > 0 ? Number((catSums.practicality / catCounts.practicality).toFixed(1)) : 0,
    technology: catCounts.technology > 0 ? Number((catSums.technology / catCounts.technology).toFixed(1)) : 0,
    valueForMoney: catCounts.valueForMoney > 0 ? Number((catSums.valueForMoney / catCounts.valueForMoney).toFixed(1)) : 0,
  };

  const topPros = Object.entries(proFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ text, count }));

  const topCons = Object.entries(conFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ text, count }));

  return {
    vehicleSlug,
    totalReviews,
    averageRating,
    ratingDistribution: distribution,
    categoryAverages,
    verifiedOwnerReviewsCount: verifiedCount,
    totalDiscussions: discussions.length,
    isSampleSmall: totalReviews < 3,
    topPros,
    topCons,
  };
}

// Get highest rated vehicles dynamically
export function getHighestRatedVehicles(limit = 6): { vehicleSlug: string; averageRating: number; reviewCount: number; verifiedCount: number }[] {
  const reviews = getPublicReviews();
  const map = new Map<string, { sum: number; count: number; verified: number }>();

  reviews.forEach((r) => {
    const existing = map.get(r.vehicleSlug) || { sum: 0, count: 0, verified: 0 };
    existing.sum += r.overallRating;
    existing.count++;
    if (r.verificationStatus === 'verified') existing.verified++;
    map.set(r.vehicleSlug, existing);
  });

  return Array.from(map.entries())
    .map(([slug, data]) => ({
      vehicleSlug: slug,
      averageRating: Number((data.sum / data.count).toFixed(1)),
      reviewCount: data.count,
      verifiedCount: data.verified,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

// ==========================================
// REVIEW CRUD & VALIDATION
// ==========================================

export function saveOwnerReview(
  reviewData: Partial<OwnerReview>,
  currentUser: { id: string; fullName: string; role?: string; avatarUrl?: string }
): { success: boolean; error?: string; review?: OwnerReview } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Authentication required. Please sign in to submit a review.' };
  }

  // 1. Vehicle Validation: Check vehicle exists in catalog
  if (!reviewData.vehicleSlug) {
    return { success: false, error: 'Vehicle selection is required.' };
  }

  const catalogVehicle = VEHICLES.find((v) => v.slug === reviewData.vehicleSlug || v.id === reviewData.vehicleSlug);
  if (!catalogVehicle) {
    return { success: false, error: 'Selected vehicle does not exist in the official AutoVerse catalog.' };
  }

  // 2. Rating Validation
  const overall = Number(reviewData.overallRating);
  if (isNaN(overall) || overall < 1 || overall > 5) {
    return { success: false, error: 'Overall rating must be between 1.0 and 5.0 stars.' };
  }

  // 3. Title & Content Validation
  const title = (reviewData.title || '').trim();
  if (title.length < 5) {
    return { success: false, error: 'Review headline must be at least 5 characters long.' };
  }
  if (title.length > 150) {
    return { success: false, error: 'Review headline cannot exceed 150 characters.' };
  }

  const experience = (reviewData.writtenExperience || '').trim();
  if (experience.length < 50) {
    return { success: false, error: 'Written experience must be at least 50 characters to provide helpful context.' };
  }
  if (experience.length > 3000) {
    return { success: false, error: 'Written experience cannot exceed 3,000 characters.' };
  }

  // 4. Rate-limiting / anti-spam: Prevent spam flooding (minimum 15s between submissions)
  const allReviews = getAllReviews();
  const existingReviewIndex = reviewData.id ? allReviews.findIndex((r) => r.id === reviewData.id) : -1;

  if (existingReviewIndex >= 0) {
    const existing = allReviews[existingReviewIndex];
    // Authorization check: Only author or admin can update
    if (existing.authorId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, error: 'Unauthorized: You cannot edit another driver’s review.' };
    }

    const updated: OwnerReview = {
      ...existing,
      ...reviewData,
      overallRating: overall,
      title,
      writtenExperience: experience,
      pros: Array.isArray(reviewData.pros) ? reviewData.pros.map((p) => p.trim()).filter(Boolean) : existing.pros,
      cons: Array.isArray(reviewData.cons) ? reviewData.cons.map((c) => c.trim()).filter(Boolean) : existing.cons,
      updatedAt: new Date().toISOString(),
    };

    allReviews[existingReviewIndex] = updated;
    saveAllReviews(allReviews);
    return { success: true, review: updated };
  }

  // Create new review
  const newReview: OwnerReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    vehicleSlug: catalogVehicle.slug || catalogVehicle.id,
    vehicleModel: catalogVehicle.model,
    vehicleBrand: catalogVehicle.brand,
    vehicleVariant: reviewData.vehicleVariant || catalogVehicle.variant || 'Standard Trim',
    authorId: currentUser.id,
    authorName: currentUser.fullName,
    authorAvatar: currentUser.avatarUrl,
    overallRating: overall,
    categoryRatings: reviewData.categoryRatings || {},
    ownershipDuration: reviewData.ownershipDuration || 'less_than_6_months',
    drivingConditions: reviewData.drivingConditions || 'mixed_daily',
    approximateMileage: reviewData.approximateMileage || '',
    title,
    writtenExperience: experience,
    pros: Array.isArray(reviewData.pros) ? reviewData.pros.map((p) => p.trim()).filter(Boolean) : [],
    cons: Array.isArray(reviewData.cons) ? reviewData.cons.map((c) => c.trim()).filter(Boolean) : [],
    ownershipCostObservations: reviewData.ownershipCostObservations,
    verificationStatus: 'not_verified',
    status: 'published',
    helpfulCount: 0,
    notHelpfulCount: 0,
    reportCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allReviews.unshift(newReview);
  saveAllReviews(allReviews);
  return { success: true, review: newReview };
}

export function deleteOwnerReview(
  reviewId: string,
  currentUser: { id: string; role?: string }
): { success: boolean; error?: string } {
  const reviews = getAllReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);
  if (index < 0) return { success: false, error: 'Review not found.' };

  const target = reviews[index];
  if (target.authorId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: You do not have permission to delete this review.' };
  }

  reviews.splice(index, 1);
  saveAllReviews(reviews);
  return { success: true };
}

// ==========================================
// DISCUSSIONS & REPLIES ENGINE
// ==========================================

export function getDiscussions(vehicleSlug?: string, category?: string): VehicleDiscussion[] {
  if (typeof window === 'undefined') return SEED_DISCUSSIONS;
  try {
    const raw = localStorage.getItem(DISCUSSIONS_KEY);
    const list: VehicleDiscussion[] = raw ? JSON.parse(raw) : SEED_DISCUSSIONS;
    return list
      .filter((d) => d.status !== 'hidden' && d.status !== 'flagged')
      .filter((d) => !vehicleSlug || d.vehicleSlug === vehicleSlug)
      .filter((d) => !category || category === 'all' || d.category === category)
      .sort((a, b) => new Date(b.lastActivityAt || b.createdAt).getTime() - new Date(a.lastActivityAt || a.createdAt).getTime());
  } catch {
    return SEED_DISCUSSIONS;
  }
}

export function getDiscussionById(id: string): VehicleDiscussion | null {
  const list = getDiscussions();
  return list.find((d) => d.id === id) || null;
}

export function saveAllDiscussions(discussions: VehicleDiscussion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(discussions));
    window.dispatchEvent(new CustomEvent('autoverse_discussions_updated'));
  } catch (err) {
    console.error('Failed to save discussions:', err);
  }
}

export function createDiscussion(
  data: Partial<VehicleDiscussion>,
  currentUser: { id: string; fullName: string; role?: string; avatarUrl?: string }
): { success: boolean; error?: string; discussion?: VehicleDiscussion } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Authentication required to start a community discussion.' };
  }

  const title = (data.title || '').trim();
  if (title.length < 5) return { success: false, error: 'Discussion title must be at least 5 characters long.' };
  if (title.length > 200) return { success: false, error: 'Title cannot exceed 200 characters.' };

  const content = (data.content || '').trim();
  if (content.length < 20) return { success: false, error: 'Discussion post must be at least 20 characters long.' };
  if (content.length > 5000) return { success: false, error: 'Content cannot exceed 5,000 characters.' };

  const catalogVehicle = VEHICLES.find((v) => v.slug === data.vehicleSlug || v.id === data.vehicleSlug);
  if (!catalogVehicle) return { success: false, error: 'Vehicle not recognized in catalog.' };

  const discussions = getDiscussions();
  const isOwner = hasVerifiedBadge(currentUser.id, catalogVehicle.slug || catalogVehicle.id);

  const newDisc: VehicleDiscussion = {
    id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    vehicleSlug: catalogVehicle.slug || catalogVehicle.id,
    vehicleModel: catalogVehicle.model,
    vehicleBrand: catalogVehicle.brand,
    authorId: currentUser.id,
    authorName: currentUser.fullName,
    authorAvatar: currentUser.avatarUrl,
    isVerifiedOwner: isOwner,
    title,
    content,
    category: data.category || 'general',
    tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
    status: 'active',
    helpfulVotes: 0,
    replyCount: 0,
    reportCount: 0,
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  discussions.unshift(newDisc);
  saveAllDiscussions(discussions);
  return { success: true, discussion: newDisc };
}

export function getDiscussionReplies(discussionId: string): DiscussionReply[] {
  if (typeof window === 'undefined') return SEED_REPLIES.filter((r) => r.discussionId === discussionId);
  try {
    const raw = localStorage.getItem(REPLIES_KEY);
    const list: DiscussionReply[] = raw ? JSON.parse(raw) : SEED_REPLIES;
    return list
      .filter((r) => r.discussionId === discussionId && r.status === 'active')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveAllReplies(replies: DiscussionReply[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
    window.dispatchEvent(new CustomEvent('autoverse_replies_updated'));
  } catch (err) {
    console.error('Failed to save replies:', err);
  }
}

export function addDiscussionReply(
  discussionId: string,
  content: string,
  currentUser: { id: string; fullName: string; role?: string; avatarUrl?: string }
): { success: boolean; error?: string; reply?: DiscussionReply } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Please sign in to reply to this discussion.' };
  }

  const clean = (content || '').trim();
  if (clean.length < 5) return { success: false, error: 'Reply must be at least 5 characters long.' };
  if (clean.length > 2500) return { success: false, error: 'Reply cannot exceed 2,500 characters.' };

  const discussions = getDiscussions();
  const disc = discussions.find((d) => d.id === discussionId);
  if (!disc) return { success: false, error: 'Discussion not found.' };

  const allReplies = typeof window !== 'undefined' && localStorage.getItem(REPLIES_KEY)
    ? JSON.parse(localStorage.getItem(REPLIES_KEY) || '[]')
    : SEED_REPLIES;

  const isOwner = hasVerifiedBadge(currentUser.id, disc.vehicleSlug);

  const newReply: DiscussionReply = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    discussionId,
    authorId: currentUser.id,
    authorName: currentUser.fullName,
    authorAvatar: currentUser.avatarUrl,
    isVerifiedOwner: isOwner,
    content: clean,
    helpfulVotes: 0,
    reportCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allReplies.push(newReply);
  saveAllReplies(allReplies);

  // Update discussion reply count & lastActivityAt
  disc.replyCount = (disc.replyCount || 0) + 1;
  disc.lastActivityAt = new Date().toISOString();
  saveAllDiscussions(discussions);

  return { success: true, reply: newReply };
}

// ==========================================
// HELPFUL VOTING & SAVED ITEMS (PERSISTENT PER USER)
// ==========================================

export function getAllVotes(): HelpfulVote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllVotes(votes: HelpfulVote[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch (err) {
    console.error('Failed to save votes:', err);
  }
}

export function getUserVote(targetType: 'review' | 'discussion' | 'reply', targetId: string, userId: string): 'helpful' | 'not_helpful' | null {
  if (!userId) return null;
  const votes = getAllVotes();
  const found = votes.find((v) => v.userId === userId && v.targetType === targetType && v.targetId === targetId);
  return found ? found.voteType : null;
}

export function toggleHelpfulVote(
  targetType: 'review' | 'discussion' | 'reply',
  targetId: string,
  voteType: 'helpful' | 'not_helpful',
  currentUser: { id: string }
): { success: boolean; error?: string; helpfulCount: number; notHelpfulCount: number; userVote: 'helpful' | 'not_helpful' | null } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Sign in to submit a helpful vote.', helpfulCount: 0, notHelpfulCount: 0, userVote: null };
  }

  const votes = getAllVotes();
  const voteIdx = votes.findIndex((v) => v.userId === currentUser.id && v.targetType === targetType && v.targetId === targetId);

  let newVoteType: 'helpful' | 'not_helpful' | null = voteType;

  if (voteIdx >= 0) {
    if (votes[voteIdx].voteType === voteType) {
      // Toggle off / remove vote
      votes.splice(voteIdx, 1);
      newVoteType = null;
    } else {
      // Switch vote
      votes[voteIdx].voteType = voteType;
      newVoteType = voteType;
    }
  } else {
    // Add vote
    votes.push({
      id: `vt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: currentUser.id,
      targetType,
      targetId,
      voteType,
      createdAt: new Date().toISOString(),
    });
    newVoteType = voteType;
  }

  saveAllVotes(votes);

  // Recalculate target counts
  const targetVotes = votes.filter((v) => v.targetType === targetType && v.targetId === targetId);
  const helpfulCount = targetVotes.filter((v) => v.voteType === 'helpful').length;
  const notHelpfulCount = targetVotes.filter((v) => v.voteType === 'not_helpful').length;

  // Persist to target record
  if (targetType === 'review') {
    const reviews = getAllReviews();
    const rev = reviews.find((r) => r.id === targetId);
    if (rev) {
      rev.helpfulCount = helpfulCount;
      rev.notHelpfulCount = notHelpfulCount;
      saveAllReviews(reviews);
    }
  } else if (targetType === 'discussion') {
    const discussions = getDiscussions();
    const disc = discussions.find((d) => d.id === targetId);
    if (disc) {
      disc.helpfulVotes = helpfulCount;
      saveAllDiscussions(discussions);
    }
  }

  return { success: true, helpfulCount, notHelpfulCount, userVote: newVoteType };
}

// Saved Content Management
export function getAllSavedItems(): SavedCommunityItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllSavedItems(items: SavedCommunityItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('autoverse_community_saved_updated'));
  } catch (err) {
    console.error('Failed to save saved items:', err);
  }
}

export function isItemSaved(itemType: 'review' | 'discussion', itemId: string, userId?: string): boolean {
  if (!userId) return false;
  return getAllSavedItems().some((s) => s.userId === userId && s.itemType === itemType && s.itemId === itemId);
}

export function toggleSaveCommunityItem(
  itemType: 'review' | 'discussion',
  itemId: string,
  currentUser: { id: string }
): { success: boolean; isSaved: boolean; error?: string } {
  if (!currentUser || !currentUser.id) {
    return { success: false, isSaved: false, error: 'Sign in to save community content.' };
  }

  const items = getAllSavedItems();
  const idx = items.findIndex((s) => s.userId === currentUser.id && s.itemType === itemType && s.itemId === itemId);

  let isSaved = false;
  if (idx >= 0) {
    items.splice(idx, 1);
    isSaved = false;
  } else {
    items.push({
      id: `sav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: currentUser.id,
      itemType,
      itemId,
      savedAt: new Date().toISOString(),
    });
    isSaved = true;
  }

  saveAllSavedItems(items);
  return { success: true, isSaved };
}

export function getUserSavedReviews(userId: string): OwnerReview[] {
  if (!userId) return [];
  const saved = getAllSavedItems().filter((s) => s.userId === userId && s.itemType === 'review');
  const savedIds = new Set(saved.map((s) => s.itemId));
  return getAllReviews().filter((r) => savedIds.has(r.id) && r.status === 'published');
}

export function getUserSavedDiscussions(userId: string): VehicleDiscussion[] {
  if (!userId) return [];
  const saved = getAllSavedItems().filter((s) => s.userId === userId && s.itemType === 'discussion');
  const savedIds = new Set(saved.map((s) => s.itemId));
  return getDiscussions().filter((d) => savedIds.has(d.id));
}

// ==========================================
// OWNERSHIP VERIFICATION WORKFLOW
// ==========================================

export function hasVerifiedBadge(userId: string, vehicleSlug: string): boolean {
  const reviews = getAllReviews();
  return reviews.some((r) => r.authorId === userId && r.vehicleSlug === vehicleSlug && r.verificationStatus === 'verified');
}

export function getAdminVerificationRequests(): OwnershipVerificationRequest[] {
  if (typeof window === 'undefined') return SEED_VERIFICATION_REQUESTS;
  try {
    const raw = localStorage.getItem(VERIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : SEED_VERIFICATION_REQUESTS;
  } catch {
    return SEED_VERIFICATION_REQUESTS;
  }
}

export function saveAllVerificationRequests(requests: OwnershipVerificationRequest[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('autoverse_verifications_updated'));
  } catch (err) {
    console.error('Failed to save verifications:', err);
  }
}

export function submitOwnershipVerification(
  data: {
    vehicleSlug: string;
    documentType: DocumentType;
    vinNumber: string;
  },
  currentUser: { id: string; fullName: string; email: string }
): { success: boolean; error?: string; request?: OwnershipVerificationRequest } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Authentication required to submit verification request.' };
  }

  const vin = (data.vinNumber || '').trim().toUpperCase();
  if (vin.length < 11 || vin.length > 17) {
    return { success: false, error: 'Please enter a valid 11-17 character Vehicle Identification Number (VIN).' };
  }

  const catalogVehicle = VEHICLES.find((v) => v.slug === data.vehicleSlug || v.id === data.vehicleSlug);
  if (!catalogVehicle) return { success: false, error: 'Vehicle not recognized.' };

  const requests = getAdminVerificationRequests();
  const masked = maskVin(vin);

  const newReq: OwnershipVerificationRequest = {
    id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: currentUser.id,
    userFullName: currentUser.fullName,
    userEmail: currentUser.email,
    vehicleSlug: catalogVehicle.slug || catalogVehicle.id,
    vehicleModel: `${catalogVehicle.brand} ${catalogVehicle.model}`,
    documentType: data.documentType,
    vinMasked: masked,
    proofReference: `TOKEN_AUDIT_${Date.now().toString(36).toUpperCase()}`,
    status: 'pending',
    reviewerNotes: 'Official ownership audit submitted. Stored in restricted concierge vault.',
    createdAt: new Date().toISOString(),
  };

  requests.unshift(newReq);
  saveAllVerificationRequests(requests);

  // Mark pending status on user's reviews for this car
  const reviews = getAllReviews();
  reviews.forEach((r) => {
    if (r.authorId === currentUser.id && r.vehicleSlug === newReq.vehicleSlug && r.verificationStatus === 'not_verified') {
      r.verificationStatus = 'pending';
      r.verificationDetails = {
        vinMasked: masked,
        documentType: data.documentType,
        submittedAt: new Date().toISOString(),
      };
    }
  });
  saveAllReviews(reviews);

  return { success: true, request: newReq };
}

export function moderateVerificationRequest(
  requestId: string,
  action: 'approve' | 'reject',
  notes: string,
  admin: { id: string; fullName: string }
): { success: boolean; error?: string } {
  const requests = getAdminVerificationRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Verification request not found.' };

  req.status = action === 'approve' ? 'approved' : 'rejected';
  req.reviewedAt = new Date().toISOString();
  req.reviewedBy = admin.fullName;
  req.reviewerNotes = notes || (action === 'approve' ? 'Approved by AutoVerse Concierge' : 'Proof document did not match records.');
  saveAllVerificationRequests(requests);

  // Update associated reviews
  const reviews = getAllReviews();
  reviews.forEach((r) => {
    if (r.authorId === req.userId && r.vehicleSlug === req.vehicleSlug) {
      if (action === 'approve') {
        r.verificationStatus = 'verified';
        r.verificationDetails = {
          ...r.verificationDetails,
          vinMasked: req.vinMasked,
          documentType: req.documentType,
          reviewedAt: new Date().toISOString(),
          reviewedBy: admin.fullName,
          verifiedBadgeExplanation: 'Verified Owner: Vehicle registration title independently audited by AutoVerse Concierge.',
        };
      } else {
        r.verificationStatus = 'rejected';
        r.verificationDetails = {
          ...r.verificationDetails,
          rejectionReason: notes || 'Verification proof failed verification criteria.',
        };
      }
    }
  });
  saveAllReviews(reviews);

  logAdminActivity(
    action === 'approve' ? 'UPDATE' : 'UPDATE',
    'review',
    requestId,
    `Ownership Verification (${req.vehicleModel})`,
    `${action.toUpperCase()} verification for ${req.userFullName}. Notes: ${notes || 'None'}`
  );

  return { success: true };
}

// ==========================================
// CONTENT REPORTING & ADMIN MODERATION
// ==========================================

export function getAdminReports(): ContentReport[] {
  if (typeof window === 'undefined') return SEED_REPORTS;
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : SEED_REPORTS;
  } catch {
    return SEED_REPORTS;
  }
}

export function saveAllReports(reports: ContentReport[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('autoverse_reports_updated'));
  } catch (err) {
    console.error('Failed to save reports:', err);
  }
}

export function submitContentReport(
  targetType: 'review' | 'discussion' | 'reply',
  targetId: string,
  reason: ReportReason,
  details: string,
  currentUser: { id: string; fullName?: string }
): { success: boolean; error?: string } {
  if (!currentUser || !currentUser.id) {
    return { success: false, error: 'Sign in required to submit a report.' };
  }

  const reports = getAdminReports();
  // Prevent duplicate report from same user on same target
  const hasReported = reports.some((r) => r.reporterId === currentUser.id && r.targetType === targetType && r.targetId === targetId && r.status === 'pending');
  if (hasReported) {
    return { success: false, error: 'You have already submitted a pending report for this item.' };
  }

  let title = 'Community Item';
  let vehicleSlug = '';

  if (targetType === 'review') {
    const rev = getReviewById(targetId);
    if (rev) {
      title = rev.title;
      vehicleSlug = rev.vehicleSlug;
      rev.reportCount = (rev.reportCount || 0) + 1;
      saveAllReviews(getAllReviews());
    }
  } else if (targetType === 'discussion') {
    const disc = getDiscussionById(targetId);
    if (disc) {
      title = disc.title;
      vehicleSlug = disc.vehicleSlug;
      disc.reportCount = (disc.reportCount || 0) + 1;
      saveAllDiscussions(getDiscussions());
    }
  }

  const newReport: ContentReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reporterId: currentUser.id,
    reporterName: currentUser.fullName || 'Community Member',
    targetType,
    targetId,
    targetTitle: title,
    vehicleSlug,
    reason,
    details: details.trim() || 'No additional notes provided.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  saveAllReports(reports);
  return { success: true };
}

export function moderateReportedContent(
  reportId: string,
  action: 'hide' | 'delete' | 'dismiss',
  notes: string,
  admin: { id: string; fullName: string }
): { success: boolean; error?: string } {
  const reports = getAdminReports();
  const rep = reports.find((r) => r.id === reportId);
  if (!rep) return { success: false, error: 'Report not found.' };

  rep.status = 'actioned';
  rep.actionTaken = action === 'hide' ? 'hidden' : action === 'delete' ? 'deleted' : 'dismissed';
  rep.moderatedBy = admin.fullName;
  rep.moderatedAt = new Date().toISOString();
  rep.moderationNotes = notes || `Action: ${action}`;
  saveAllReports(reports);

  // Apply action to content
  if (action === 'hide' || action === 'delete') {
    const targetStatus = action === 'hide' ? 'hidden' : 'deleted';
    if (rep.targetType === 'review') {
      const reviews = getAllReviews();
      const r = reviews.find((x) => x.id === rep.targetId);
      if (r) {
        r.status = targetStatus;
        saveAllReviews(reviews);
      }
    } else if (rep.targetType === 'discussion') {
      const discussions = getDiscussions();
      const d = discussions.find((x) => x.id === rep.targetId);
      if (d) {
        d.status = targetStatus;
        saveAllDiscussions(discussions);
      }
    }
  }

  logAdminActivity(
    action === 'delete' ? 'DELETE' : 'UPDATE',
    'review',
    reportId,
    `Moderated ${rep.targetType}: ${rep.targetTitle}`,
    `Moderation action: ${action.toUpperCase()}. Reason: ${notes || rep.reason}`
  );

  return { success: true };
}
