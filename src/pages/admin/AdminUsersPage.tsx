// AutoVerse Stage 7: Protected User Directory & Role Assignment
// Role governance, account suspension, and last-admin lockout security protections

import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  getAllUsersForAdmin,
  updateUserRoleByAdmin,
  updateUserStatusByAdmin,
  getCurrentAdmin,
} from '../../utils/auth';
import type { UserPublicProfile, UserRole, UserStatus } from '../../types/auth';
import { logAdminActivity } from '../../utils/adminStore';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserPublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAdmin = getCurrentAdmin();

  const loadData = () => {
    try {
      setUsers(getAllUsersForAdmin());
    } catch (err: any) {
      setErrorMessage(err.message || 'Unauthorized access.');
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('autoverse_auth_changed', handleUpdate);
    return () => window.removeEventListener('autoverse_auth_changed', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleChange = (targetUser: UserPublicProfile, newRole: UserRole) => {
    setErrorMessage(null);
    const res = updateUserRoleByAdmin(targetUser.id, newRole);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      showToast(res.message);
      logAdminActivity(
        'ROLE_CHANGE',
        'user',
        targetUser.id,
        targetUser.fullName,
        `Role permissions updated to ${newRole.toUpperCase()}.`
      );
      loadData();
    }
  };

  const handleStatusChange = (targetUser: UserPublicProfile, newStatus: UserStatus) => {
    setErrorMessage(null);
    const res = updateUserStatusByAdmin(targetUser.id, newStatus);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      showToast(res.message);
      logAdminActivity(
        'STATUS_CHANGE',
        'user',
        targetUser.id,
        targetUser.fullName,
        `Account access status set to ${newStatus.toUpperCase()}.`
      );
      loadData();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '2rem',
            zIndex: 10000,
            backgroundColor: '#090c12',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: '#f8fafc',
          }}
        >
          <ShieldAlert size={20} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--accent-red)' }}>Security Policy Enforcement: </strong>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#ffffff' }}>
          User Directory & Privilege Governance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Manage authenticated driver accounts, verification status, and role elevation. Self-demotion and removal of the last administrator are cryptographically blocked.
        </p>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver name or email..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          style={{
            padding: '0.55rem 0.85rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '0.82rem',
          }}
        >
          <option value="All">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="driver">Drivers</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Driver Profile</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email & Verification</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Role</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                  Privilege Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isCurrent = currentAdmin?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: u.role === 'admin' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            border: `1px solid ${u.role === 'admin' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: u.role === 'admin' ? 'var(--accent-cyan)' : '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>
                            {u.fullName} {isCurrent && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#ffffff' }}>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                        {u.isVerified ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} /> Verified Account
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Pending Email Verification</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor:
                            u.role === 'admin' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: u.role === 'admin' ? 'var(--accent-cyan)' : '#e2e8f0',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(6, 182, 212, 0.3)' : 'var(--border-subtle)'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor:
                            u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.status === 'active' ? '#10b981' : 'var(--accent-red)',
                          border: `1px solid ${u.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {/* Promote / Demote Role */}
                        {u.role === 'driver' ? (
                          <button
                            onClick={() => handleRoleChange(u, 'admin')}
                            title="Promote to Administrator"
                            style={{
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              color: 'var(--accent-cyan)',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <ShieldCheck size={13} />
                            <span>Make Admin</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u, 'driver')}
                            title="Demote to Driver"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Demote
                          </button>
                        )}

                        {/* Suspend / Activate */}
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(u, 'suspended')}
                            disabled={isCurrent}
                            title={isCurrent ? 'Cannot suspend own account' : 'Suspend Account'}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: 'var(--accent-red)',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: isCurrent ? 'not-allowed' : 'pointer',
                              opacity: isCurrent ? 0.4 : 1,
                            }}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u, 'active')}
                            title="Re-activate Account"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#10b981',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Re-activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
