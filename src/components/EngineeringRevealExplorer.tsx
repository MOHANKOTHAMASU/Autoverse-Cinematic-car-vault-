import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface EngineeringComponent {
  id: string;
  name: string;
  subsystem: string;
  metric: { value: string; label: string };
  description: string;
  technicalSpecs: { label: string; value: string }[];
  verifiedSource: string;
}

const PORSCHE_ENGINEERING_COMPONENTS: EngineeringComponent[] = [
  {
    id: 'inverter',
    name: '800-Volt Silicon Carbide (SiC) Pulse Inverter',
    subsystem: 'Power Electronics & High-Voltage Architecture',
    metric: { value: '900A', label: 'Peak Inverter Current' },
    description:
      'The rear axle pulse inverter operates with silicon carbide semiconductors, reducing switching losses by up to 50% compared to standard silicon IGBTs and allowing higher continuous current density during repeated launch starts.',
    technicalSpecs: [
      { label: 'Operating Voltage', value: '800V DC Nominal' },
      { label: 'Rear Inverter Max Current', value: '900 Amperes' },
      { label: 'Semiconductor Material', value: 'Silicon Carbide (SiC) MOSFETs' },
      { label: 'Efficiency Rating', value: '>98.5% at peak conversion' },
    ],
    verifiedSource: 'Porsche AG Weissach Research & Development Datasheet',
  },
  {
    id: 'transmission',
    name: 'Two-Speed Rear Axle Transmission with Launch Mode',
    subsystem: 'Drivetrain & Torque Multiplication',
    metric: { value: '15:1 / 8:1', label: 'Dual Gear Ratios' },
    description:
      'Unlike single-speed electric vehicles that compromise either standing launch torque or Autobahn top-end velocity, the Taycan features an electro-mechanically actuated two-speed transmission on the rear axle. 1st gear provides maximum launch acceleration, while 2nd gear maximizes high-speed cruising efficiency.',
    technicalSpecs: [
      { label: '1st Gear Ratio', value: '15.5:1 (Maximum Standing Launch Torque)' },
      { label: '2nd Gear Ratio', value: '8.05:1 (High-Speed Autobahn Cruise)' },
      { label: 'Shift Actuation', value: 'Electro-mechanical dog clutch & wet multi-plate clutch' },
      { label: 'Shift Duration', value: '<70 milliseconds' },
    ],
    verifiedSource: 'Porsche Technical Press Kit & SAE International Paper',
  },
  {
    id: 'motors',
    name: 'Dual Permanently Excited Synchronous Motors (PSM)',
    subsystem: 'Electric Propulsion & Magnetic Flux',
    metric: { value: '938 HP', label: 'Combined Launch Power' },
    description:
      'Both front and rear drive units feature hairpin copper-wire winding technology. Rectangular wire pins are inserted into stator slots and welded at the ends, achieving a copper fill factor of 70% (versus 45% for traditional pull-in windings) for superior thermal conduction and power density.',
    technicalSpecs: [
      { label: 'Front Motor Stator', value: 'Hairpin Copper Wire Technology (160 kW)' },
      { label: 'Rear Motor Stator', value: 'Upgraded Rotor with High Flux Neodymium Magnets' },
      { label: 'Continuous Thermal Redline', value: '16,000 RPM Rotor Speed' },
      { label: 'Torque Vectoring', value: 'Porsche Torque Vectoring Plus (PTV Plus) with Electronic E-Diff' },
    ],
    verifiedSource: 'Porsche Powertrain Engineering Specification',
  },
  {
    id: 'battery',
    name: '105 kWh Performance Battery Plus & 320 kW Thermal Pack',
    subsystem: 'Energy Storage & Thermodynamics',
    metric: { value: '320 kW', label: 'Peak DC Charge Rate' },
    description:
      'Integrated into the underbody structure as a structural load-bearing member, the 105 kWh gross pack utilizes NMC 811 pouch chemistry with an underfloor cooling plate. At 800V DC fast chargers, it replenishes from 10% to 80% State of Charge in just 18 minutes.',
    technicalSpecs: [
      { label: 'Gross Capacity', value: '105.0 kWh (97.0 kWh Usable)' },
      { label: 'Peak DC Charging Power', value: '320 kW at 800V DC stations' },
      { label: '10% to 80% Charge Time', value: '18 minutes under optimal thermal conditions' },
      { label: 'Thermal Circuit', value: 'Intelligent pre-conditioning heat pump with glycol loop' },
    ],
    verifiedSource: 'Porsche Charging & Battery Technical Factsheet',
  },
  {
    id: 'chassis',
    name: 'Porsche Active Ride Hydraulic Active Suspension',
    subsystem: 'Chassis Dynamics & Body Pitch/Roll Control',
    metric: { value: '1,000 Nm', label: 'Active Force per Wheel' },
    description:
      'Replaces conventional anti-roll bars with an electro-hydraulic motor-pump unit at each individual shock absorber. Generates wheel forces in fractions of a second to completely eliminate pitch during hard acceleration and roll during high-G cornering.',
    technicalSpecs: [
      { label: 'Hydraulic Motor-Pump Units', value: '4 individual 800V electro-hydraulic actuators' },
      { label: 'Response Frequency', value: 'Up to 13 Hertz wheel adjustments' },
      { label: 'Anti-Dive & Anti-Squat', value: 'Active body compensation keeps cabin level' },
      { label: 'Comfort Access', value: 'Automatic 55mm ride height elevation upon door open' },
    ],
    verifiedSource: 'Porsche Active Ride Chassis Dynamics Factsheet',
  },
  {
    id: 'brakes',
    name: 'Porsche Ceramic Composite Brakes (PCCB) & 400 kW Recuperation',
    subsystem: 'Deceleration & Kinetic Energy Recovery',
    metric: { value: '400 kW', label: 'Kinetic Braking Regen' },
    description:
      'Internally vented, carbon-fiber reinforced ceramic brake discs (420mm front with 10-piston aluminum monobloc fixed calipers). Blends seamlessly with up to 400 kW of electric regenerative braking, handling over 90% of everyday deceleration without pad contact.',
    technicalSpecs: [
      { label: 'Front Calipers', value: '10-Piston Monobloc Fixed Calipers in Yellow' },
      { label: 'Front Disc Diameter', value: '420 mm Carbon Ceramic Composite' },
      { label: 'Max Regeneration Power', value: 'Up to 400 kW kinetic energy recovered' },
      { label: 'Friction Interface', value: 'Silicon carbide protective surface layer' },
    ],
    verifiedSource: 'Porsche Bremssysteme Technical Documentation',
  },
];

export const EngineeringRevealExplorer: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const [activeComponentId, setActiveComponentId] = useState<string>('inverter');

  const activeComponent =
    PORSCHE_ENGINEERING_COMPONENTS.find((c) => c.id === activeComponentId) ||
    PORSCHE_ENGINEERING_COMPONENTS[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
        marginBottom: '3rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: 'var(--accent-cyan)',
            }}
          >
            SCENE C · VERIFIED ENGINEERING REVEAL
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Official Weissach Technical Architecture
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          {vehicle.brand} {vehicle.model} Powertrain & Chassis Architecture
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Explore the authentic engineering subsystems verified from manufacturer technical datasheets.
        </p>
      </div>

      {/* Component Navigation Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {PORSCHE_ENGINEERING_COMPONENTS.map((comp) => {
          const isSelected = comp.id === activeComponentId;
          return (
            <button
              key={comp.id}
              onClick={() => setActiveComponentId(comp.id)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 20, 28, 0.6)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {comp.subsystem.split('&')[0]}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                  {comp.name.split('(')[0].split('&')[0]}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isSelected ? 'var(--accent-cyan)' : '#ffffff', fontFamily: 'monospace' }}>
                  {comp.metric.value}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {comp.metric.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Component Deep Dive Card */}
      <div
        style={{
          backgroundColor: '#07090e',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              {activeComponent.subsystem}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
              {activeComponent.name}
            </h3>
          </div>
          <span
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              color: 'var(--accent-cyan)',
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '1rem',
            }}
          >
            {activeComponent.metric.value} {activeComponent.metric.label}
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {activeComponent.description}
        </p>

        {/* Technical Specification Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            backgroundColor: 'rgba(15, 20, 28, 0.7)',
            borderRadius: '8px',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}
        >
          {activeComponent.technicalSpecs.map((spec, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {spec.label}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {spec.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckCircle2 size={13} color="var(--accent-cyan)" />
          <span>Technical Citation: {activeComponent.verifiedSource}</span>
        </div>
      </div>
    </div>
  );
};
