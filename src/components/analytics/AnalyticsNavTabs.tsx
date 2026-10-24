// AutoVerse Stage 24: Admin Analytics Section Navigation Tabs

import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Car, ShoppingBag, Building2, Tag } from 'lucide-react';

const TABS = [
  { to: '/admin/analytics', label: 'Executive Overview', icon: BarChart3, end: true },
  { to: '/admin/analytics/vehicles', label: 'Vehicles & OEMs', icon: Car },
  { to: '/admin/analytics/marketplace', label: 'Marketplace Inventory', icon: ShoppingBag },
  { to: '/admin/analytics/dealers', label: 'Dealers & Test Drives', icon: Building2 },
  { to: '/admin/analytics/offers', label: 'Offers & Financing', icon: Tag },
];

export const AnalyticsNavTabs: React.FC = () => {
  return (
    <nav
      aria-label="Analytics Section Tabs"
      style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              backgroundColor: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              color: isActive ? '#00f0ff' : '#94a3b8',
              border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
            })}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
