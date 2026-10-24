import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { ManufacturerShowcase } from '../components/ManufacturerShowcase';
import { FeaturedVehicles } from '../components/FeaturedVehicles';
import { PerformanceSection } from '../components/PerformanceSection';
import { InteriorSection } from '../components/InteriorSection';
import { LaunchesPreview } from '../components/LaunchesPreview';
import { RoadCinemaPreview } from '../components/RoadCinemaPreview';

export const HomePage: React.FC = () => {
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(null);

  return (
    <main>
      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Manufacturer Showcase */}
      <ManufacturerShowcase
        selectedManufacturerId={selectedManufacturerId}
        onSelectManufacturer={(id) => setSelectedManufacturerId(id)}
      />

      {/* 3. Featured Vehicles Fleet */}
      <FeaturedVehicles
        selectedManufacturerId={selectedManufacturerId}
        onClearManufacturerFilter={() => setSelectedManufacturerId(null)}
      />

      {/* 4. Performance & Telemetry Deep Dive */}
      <PerformanceSection />

      {/* 5. Interior & Comfort Architecture */}
      <InteriorSection />

      {/* 6. Latest Launches Official Dispatches */}
      <LaunchesPreview />

      {/* 7. Road Cinema High Fidelity Driving Motion */}
      <RoadCinemaPreview />
    </main>
  );
};
