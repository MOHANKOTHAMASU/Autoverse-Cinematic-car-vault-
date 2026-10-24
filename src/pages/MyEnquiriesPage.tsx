// AutoVerse Stage 21: Buyer Enquiries Dashboard
// View sent enquiries, track seller responses, offer status, and vehicle conversations.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserEnquiries } from '../utils/marketplaceStore';
import type { MarketplaceEnquiry } from '../types/marketplace';

export const MyEnquiriesPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [enquiries, setEnquiries] = useState<MarketplaceEnquiry[]>([]);

  const loadData = () => {
    if (!currentUser) return;
    const items = getUserEnquiries(currentUser.id);
    setEnquiries(items);
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('autoverse_marketplace_enquiries_updated', handleSync);

    return () => {
      window.removeEventListener('autoverse_marketplace_enquiries_updated', handleSync);
    };
  }, [currentUser]);

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px', color: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
          <MessageSquare size={54} color="var(--accent-cyan)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
            Sign In to View Enquiries
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please sign in to track vehicle enquiries and read direct seller replies.
          </p>
          <Link
            to="/login?redirect=/my-enquiries"
            style={{
              padding: '0.8rem 1.8rem',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090d',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            <MessageSquare size={14} />
            <span>Buyer Communication Center</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
            My Vehicle Enquiries
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            Track submitted purchase inquiries, price offers, and direct communications with verified vehicle sellers.
          </p>
        </div>
      </section>

      {/* Main Enquiries List */}
      <section style={{ padding: '2.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {enquiries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4.5rem 1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                No enquiries submitted yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                When you contact sellers about vehicles in the marketplace, your questions and their replies will appear here.
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
                <span>Browse Marketplace</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-medium)',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {enq.listingTitle}
                        </h3>
                        {enq.status === 'replied' ? (
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              border: '1px solid #10b981',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            Seller Replied
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                              border: '1px solid #f59e0b',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            Awaiting Reply
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Submitted on {new Date(enq.createdAt).toLocaleDateString()} • Preferred Contact: {enq.preferredContact.toUpperCase()}
                      </div>
                    </div>

                    <Link
                      to={`/used-cars/${enq.listingSlug}`}
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--accent-cyan)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontWeight: 600,
                      }}
                    >
                      <span>View Listing</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>

                  {enq.offeredPrice && (
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                      }}
                    >
                      Your Offered Price: {enq.offeredPrice.toLocaleString()}
                    </div>
                  )}

                  {/* Buyer's original message */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      lineHeight: 1.5,
                      marginBottom: enq.sellerReply ? '1rem' : 0,
                    }}
                  >
                    <strong>Your Message:</strong> {enq.message}
                  </div>

                  {/* Seller reply block */}
                  {enq.sellerReply && (
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderLeft: '4px solid #10b981',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <CheckCircle2 size={14} />
                        <span>Seller Response ({new Date(enq.sellerRepliedAt || '').toLocaleDateString()}):</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.5 }}>
                        "{enq.sellerReply}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
