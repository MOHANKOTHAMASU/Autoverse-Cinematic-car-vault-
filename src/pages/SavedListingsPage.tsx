// AutoVerse Stage 21: Saved Listings Page
// Displays user-bookmarked pre-owned vehicles with active/sold/paused availability indicators.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getUserSavedListingsWithDetails,
  toggleSaveListing,
  formatMarketplacePrice,
} from '../utils/marketplaceStore';
import type { MarketplaceListing } from '../types/marketplace';

export const SavedListingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest_user';

  const [savedItems, setSavedItems] = useState<
    Array<{ savedAt: string; listing: MarketplaceListing; isAvailable: boolean }>
  >([]);

  const loadData = () => {
    const items = getUserSavedListingsWithDetails(userId);
    setSavedItems(items);
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('autoverse_saved_listings_updated', handleSync);
    window.addEventListener('autoverse_marketplace_updated', handleSync);

    return () => {
      window.removeEventListener('autoverse_saved_listings_updated', handleSync);
      window.removeEventListener('autoverse_marketplace_updated', handleSync);
    };
  }, [userId]);

  const handleRemove = (listingId: string) => {
    toggleSaveListing(userId, listingId);
    loadData();
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#ffffff' }}>
      {/* Header Banner */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(12, 16, 23, 0.8)',
          padding: '2.5rem 1rem',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Bookmark size={14} />
            <span>Buyer Watchlist</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
            Saved Vehicles
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            Track price updates, availability, and seller notes on your saved pre-owned vehicles.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section style={{ padding: '2.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {savedItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4.5rem 1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <Bookmark size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Your saved collection is empty
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Browse our curated pre-owned inventory and bookmark vehicles you are interested in tracking.
              </p>
              <Link
                to="/used-cars"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>Browse Used Cars</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {savedItems.map(({ listing, isAvailable }) => (
                <div
                  key={listing.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-medium)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Photo with Overlay Badge */}
                  <div style={{ height: '200px', backgroundColor: '#05070a', position: 'relative' }}>
                    <img
                      src={listing.featuredImage || listing.images[0]}
                      alt={listing.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Availability Tag */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      {isAvailable ? (
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.9)',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Available
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {listing.status === 'sold' ? 'Sold' : 'Currently Unavailable'}
                        </span>
                      )}
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleRemove(listing.id)}
                      title="Remove from saved"
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        border: 'none',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                      {listing.year} {listing.make} {listing.model}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {listing.variant}
                    </div>

                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem' }}>
                      {formatMarketplacePrice(listing.askingPrice, listing.currency)}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <span>{listing.mileageKm.toLocaleString()} km</span>
                      <span>{listing.locationCity}</span>
                      <span style={{ textTransform: 'capitalize' }}>{listing.fuelType}</span>
                    </div>

                    <Link
                      to={`/used-cars/${listing.slug}`}
                      style={{
                        marginTop: 'auto',
                        padding: '0.65rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-medium)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>View Vehicle Dossier</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
