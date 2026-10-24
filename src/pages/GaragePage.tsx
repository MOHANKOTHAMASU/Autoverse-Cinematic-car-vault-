import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { CarImage } from '../components/CarImage';
import type { SavedConfiguration } from '../types/auth';
import {
  getSavedGarageSlugs,
  removeCarFromGarage,
  getSavedConfigurations,
  deleteSavedConfiguration,
  renameSavedConfiguration,
} from '../utils/garage';
import {
  getOwnedVehicles,
  getMaintenanceTasks,
  getServiceRecords,
  getFuelChargingLogs,
  getExpenses,
  getReminders,
  getGarageSettings,
  saveGarageSettings,
  completeMaintenanceTask,
  toggleReminderComplete,
  exportExpensesCsv,
} from '../utils/ownershipStore';
import {
  ArrowLeft,
  ShieldCheck,
  Plus,
  Sparkles,
  Clock,
  Layers,
  Wrench,
  Fuel,
  DollarSign,
  Bell,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Car,
  Trash2,
  Share2,
  Check,
  Edit2,
} from 'lucide-react';
import { AddOwnedVehicleModal } from '../components/garage/AddOwnedVehicleModal';
import { LogFuelChargingModal } from '../components/garage/LogFuelChargingModal';
import { AddServiceRecordModal } from '../components/garage/AddServiceRecordModal';
import { ScheduleMaintenanceModal } from '../components/garage/ScheduleMaintenanceModal';
import { AddReminderModal } from '../components/garage/AddReminderModal';

export const GaragePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const userId = currentUser?.id || 'demo_user';
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Active Tab
  type TabKey =
    | 'overview'
    | 'owned'
    | 'maintenance'
    | 'service'
    | 'fuel'
    | 'expenses'
    | 'reminders'
    | 'settings'
    | 'saved'
    | 'favorites'
    | 'comparisons'
    | 'configurations';

  const defaultTab = (queryParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Selected filter vehicle for tabs
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  const [expenseTimeframe, setExpenseTimeframe] = useState<'all' | 'year' | 'month'>('all');

  // Stage 10 Studio Configurator handlers
  const [copiedConfigId, setCopiedConfigId] = useState<string | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editingConfigName, setEditingConfigName] = useState('');

  const handleDeleteConfig = (id: string) => {
    deleteSavedConfiguration(id);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingConfigId(id);
    setEditingConfigName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editingConfigName.trim()) {
      renameSavedConfiguration(id, editingConfigName.trim());
      setRefreshTrigger((prev) => prev + 1);
    }
    setEditingConfigId(null);
  };

  const handleShareConfig = (cfg: SavedConfiguration) => {
    const pkgQuery = cfg.packageIds && cfg.packageIds.length > 0 ? `&packages=${cfg.packageIds.join(',')}` : '';
    const url = `${window.location.origin}/configurator/${cfg.vehicleSlug}?variant=${cfg.variantId}&paint=${cfg.paintId}&wheels=${cfg.wheelId}&interior=${cfg.interiorId}${pkgQuery}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedConfigId(cfg.id);
      setTimeout(() => setCopiedConfigId(null), 2500);
    });
  };

  // Read Ownership Data
  const ownedVehicles = getOwnedVehicles(userId);
  const maintenanceTasks = getMaintenanceTasks(
    userId,
    selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter
  );
  const serviceRecords = getServiceRecords(
    userId,
    selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter
  );
  const fuelLogs = getFuelChargingLogs(
    userId,
    selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter
  );
  const expenses = getExpenses(
    userId,
    selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter
  );
  const reminders = getReminders(
    userId,
    selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter
  );
  const settings = getGarageSettings(userId);

  // Summary Card Metrics
  const upcomingMaintenanceCount = maintenanceTasks.filter((m) => m.status === 'upcoming').length;
  const overdueMaintenanceCount = maintenanceTasks.filter((m) => m.status === 'overdue' || m.status === 'due').length;

  const filteredExpenses = expenses.filter((e) => {
    if (expenseTimeframe === 'all') return true;
    const date = new Date(e.date);
    const now = new Date();
    if (expenseTimeframe === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    if (expenseTimeframe === 'month') {
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const latestService = serviceRecords[0] || null;
  const nextReminder = reminders.find((r) => !r.isCompleted && r.enabled) || null;

  // Read Stage 6 & 10 Data
  const savedSlugs = getSavedGarageSlugs();
  const savedConfigurations = getSavedConfigurations();

  const savedVehicles: Vehicle[] = savedSlugs
    .map((slug) => VEHICLES.find((v) => v.slug === slug || v.id === slug))
    .filter((v): v is Vehicle => Boolean(v));

  useEffect(() => {
    // Sync when refreshTrigger changes
    if (refreshTrigger > 0) {
      // Triggered update
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('autoverse_ownership_updated', handleUpdate);
    window.addEventListener('autoverse_garage_updated', handleUpdate);
    window.addEventListener('autoverse_comparisons_updated', handleUpdate);
    window.addEventListener('autoverse_configurations_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('autoverse_ownership_updated', handleUpdate);
      window.removeEventListener('autoverse_garage_updated', handleUpdate);
      window.removeEventListener('autoverse_comparisons_updated', handleUpdate);
      window.removeEventListener('autoverse_configurations_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleExportCsv = () => {
    const csv = exportExpensesCsv(userId, selectedVehicleFilter === 'all' ? undefined : selectedVehicleFilter);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoverse_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">
                <Sparkles size={12} /> STAGE 11 VEHICLE OWNERSHIP HUB
              </span>
              {isAuthenticated ? (
                <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={13} /> CLOUD SYNCED // {currentUser?.fullName}
                </span>
              ) : (
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                  LOCAL VAULT ACTIVE
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                color: '#ffffff',
                marginBottom: '0.75rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              My AutoVerse Garage
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '740px', lineHeight: 1.6 }}>
              Comprehensive vehicle ownership command center. Monitor maintenance intervals, track service history,
              record fuel and high-voltage charging telemetry, analyze real expenses, and receive proactive reminders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> Add Owned Vehicle
            </button>
            <Link to="/discover" className="btn btn-secondary">
              <Car size={16} /> Browse Catalog
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Owned Vehicles */}
          <div
            onClick={() => setActiveTab('owned')}
            style={{
              backgroundColor: '#0c1017',
              border: `1px solid ${activeTab === 'owned' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Owned Vehicles
              </span>
              <Car size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 900 }}>
              {ownedVehicles.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              In your garage fleet
            </div>
          </div>

          {/* Card 2: Upcoming Maintenance */}
          <div
            onClick={() => setActiveTab('maintenance')}
            style={{
              backgroundColor: '#0c1017',
              border: `1px solid ${activeTab === 'maintenance' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Upcoming Care
              </span>
              <Wrench size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 900 }}>
              {upcomingMaintenanceCount}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Scheduled intervals
            </div>
          </div>

          {/* Card 3: Overdue / Due Maintenance */}
          <div
            onClick={() => setActiveTab('maintenance')}
            style={{
              backgroundColor: overdueMaintenanceCount > 0 ? 'rgba(244, 63, 94, 0.08)' : '#0c1017',
              border: `1px solid ${overdueMaintenanceCount > 0 ? '#f43f5e' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Due / Overdue
              </span>
              <AlertTriangle size={16} color={overdueMaintenanceCount > 0 ? '#f43f5e' : 'var(--text-secondary)'} />
            </div>
            <div style={{ fontSize: '2rem', color: overdueMaintenanceCount > 0 ? '#f43f5e' : '#ffffff', fontWeight: 900 }}>
              {overdueMaintenanceCount}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Requires attention
            </div>
          </div>

          {/* Card 4: Total Expenses */}
          <div
            onClick={() => setActiveTab('expenses')}
            style={{
              backgroundColor: '#0c1017',
              border: `1px solid ${activeTab === 'expenses' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Total Expenses
              </span>
              <DollarSign size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 900 }}>
              ${totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {expenseTimeframe === 'all' ? 'All time records' : expenseTimeframe === 'year' ? 'Current year' : 'This month'}
            </div>
          </div>

          {/* Card 5: Latest Service */}
          <div
            onClick={() => setActiveTab('service')}
            style={{
              backgroundColor: '#0c1017',
              border: `1px solid ${activeTab === 'service' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Latest Service
              </span>
              <Clock size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {latestService ? latestService.workPerformed : 'None recorded'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {latestService ? `${latestService.serviceDate} • $${latestService.cost}` : 'Record first service'}
            </div>
          </div>

          {/* Card 6: Next Reminder */}
          <div
            onClick={() => setActiveTab('reminders')}
            style={{
              backgroundColor: '#0c1017',
              border: `1px solid ${activeTab === 'reminders' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Next Reminder
              </span>
              <Bell size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextReminder ? nextReminder.title : 'All caught up'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {nextReminder ? `Due: ${nextReminder.dueDate}` : 'No pending alerts'}
            </div>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'overview' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'overview' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('owned')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'owned' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'owned' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'owned' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Car size={14} /> My Vehicles ({ownedVehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'maintenance' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'maintenance' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'maintenance' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Wrench size={14} /> Maintenance ({maintenanceTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('service')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'service' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'service' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'service' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Clock size={14} /> Service Ledger ({serviceRecords.length})
          </button>

          <button
            onClick={() => setActiveTab('fuel')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'fuel' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'fuel' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'fuel' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Fuel size={14} /> Fuel & Charging ({fuelLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'expenses' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'expenses' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'expenses' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <DollarSign size={14} /> Expenses ({expenses.length})
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'reminders' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'reminders' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'reminders' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Bell size={14} /> Reminders ({reminders.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'saved' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'saved' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'saved' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Layers size={14} /> Saved Bookmarks ({savedVehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('configurations')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'configurations' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'configurations' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'configurations' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Wrench size={14} /> Studio Builds ({savedConfigurations.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'settings' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'settings' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {ownedVehicles.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#0c1017',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: '16px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  maxWidth: '640px',
                  margin: '0 auto',
                }}
              >
                <Car size={48} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Your Garage Fleet is Empty
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Register your vehicle to track maintenance schedules, log fuel fill-ups or EV charging,
                  monitor verified expenses, and keep all service invoices organized.
                </p>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Fleet Quick Grid */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Fleet Spotlight</h3>
                    <button
                      onClick={() => setActiveTab('owned')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      View All ({ownedVehicles.length}) &rarr;
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {ownedVehicles.map((v) => (
                      <div
                        key={v.id}
                        style={{
                          backgroundColor: '#0c1017',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div style={{ height: '180px', position: 'relative' }}>
                          <img
                            src={v.photoUrl}
                            alt={`${v.make} ${v.model}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                            <span className="badge badge-cyan">{v.powertrain.toUpperCase()}</span>
                          </div>
                        </div>

                        <div style={{ padding: '1.25rem' }}>
                          <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {v.make.toUpperCase()}
                          </div>
                          <h4 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0' }}>
                            {v.year} {v.model}
                          </h4>
                          {v.nickname && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                              “{v.nickname}”
                            </div>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.75rem 0',
                              borderTop: '1px solid var(--border-light)',
                              borderBottom: '1px solid var(--border-light)',
                              margin: '0.75rem 0 1rem',
                            }}
                          >
                            <div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>ODOMETER</div>
                              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                                {v.currentOdometer.toLocaleString()} {v.odometerUnit}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>REGISTERED</div>
                              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                                {new Date(v.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link
                              to={`/garage/vehicles/${v.id}`}
                              className="btn btn-primary"
                              style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                            >
                              Vehicle Profile & Records &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Care Snapshot */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {/* Urgent Maintenance */}
                  <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.5rem' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                      Maintenance Health Overview
                    </h4>
                    {maintenanceTasks.length === 0 ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No maintenance scheduled.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {maintenanceTasks.slice(0, 4).map((t) => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.65rem 0.85rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>{t.taskName}</span>
                            <span
                              className={`badge ${
                                t.status === 'overdue' ? 'badge-red' : t.status === 'due' ? 'badge-cyan' : ''
                              }`}
                              style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
                            >
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Proactive Reminders */}
                  <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.5rem' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                      Upcoming Vehicle Deadlines
                    </h4>
                    {reminders.length === 0 ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No upcoming reminders.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {reminders.slice(0, 4).map((r) => (
                          <div
                            key={r.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.65rem 0.85rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            <div>
                              <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Due: {r.dueDate}</div>
                            </div>
                            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                              {r.type.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY OWNED VEHICLES */}
        {activeTab === 'owned' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Fleet Management</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Vehicles you currently own or manage. Linked to AutoVerse specifications or registered as custom builds.
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Add Vehicle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {ownedVehicles.map((v) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ height: '200px', position: 'relative' }}>
                    <img
                      src={v.photoUrl}
                      alt={`${v.make} ${v.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <span className="badge badge-cyan">{v.powertrain.toUpperCase()}</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                      {v.make.toUpperCase()}
                    </div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: 900, margin: '0.2rem 0' }}>
                      {v.year} {v.model}
                    </h4>
                    {v.nickname && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                        “{v.nickname}”
                      </div>
                    )}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        padding: '0.75rem 0',
                        borderTop: '1px solid var(--border-light)',
                        borderBottom: '1px solid var(--border-light)',
                        margin: '1rem 0',
                      }}
                    >
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>CURRENT ODOMETER</div>
                        <div style={{ color: '#ffffff', fontWeight: 700 }}>
                          {v.currentOdometer.toLocaleString()} {v.odometerUnit}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>PURCHASE PRICE</div>
                        <div style={{ color: '#ffffff', fontWeight: 700 }}>
                          {v.purchasePrice ? `${v.currency} ${v.purchasePrice.toLocaleString()}` : 'Private'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/garage/vehicles/${v.id}`}
                        className="btn btn-primary"
                        style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}
                      >
                        Vehicle Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Maintenance Scheduler</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Dynamic service schedules with automated status detection (Upcoming, Due, Overdue).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={selectedVehicleFilter}
                  onChange={(e) => setSelectedVehicleFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Fleet Vehicles</option>
                  {ownedVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowMaintModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={15} /> Schedule Task
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {maintenanceTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        className={`badge ${
                          task.status === 'overdue'
                            ? 'badge-red'
                            : task.status === 'due'
                            ? 'badge-cyan'
                            : task.status === 'completed'
                            ? 'badge-verified'
                            : ''
                        }`}
                        style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}
                      >
                        {task.status}
                      </span>
                      <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                        {task.taskName}
                      </h4>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {task.statusReason} {task.serviceProvider ? `• ${task.serviceProvider}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {task.estimatedCost && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Estimated</div>
                        <div style={{ color: '#ffffff', fontWeight: 700 }}>
                          {task.currency} {task.estimatedCost}
                        </div>
                      </div>
                    )}

                    {!task.isCompleted ? (
                      <button
                        onClick={() => {
                          completeMaintenanceTask(task.id, userId, {
                            createServiceRecord: true,
                            cost: task.estimatedCost,
                            provider: task.serviceProvider,
                          });
                          setRefreshTrigger((prev) => prev + 1);
                        }}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.45rem 0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: 'var(--accent-cyan)',
                          borderColor: 'var(--accent-cyan)',
                        }}
                      >
                        <CheckCircle2 size={14} /> Mark Completed
                      </button>
                    ) : (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE LEDGER */}
        {activeTab === 'service' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Service History Ledger</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Accurate chronological timeline of all repairs, scheduled services, and workshop receipts.
                </p>
              </div>

              <button
                onClick={() => setShowServiceModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Add Service Record
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {serviceRecords.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                        {rec.serviceDate}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>•</span>
                      <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {rec.odometer.toLocaleString()} {rec.odometerUnit}
                      </span>
                      {rec.isVerifiedByServiceCenter && (
                        <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                          <ShieldCheck size={11} /> DEALER CERTIFIED
                        </span>
                      )}
                    </div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      {rec.workPerformed}
                    </h4>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Workshop: {rec.serviceProvider} {rec.partsReplaced ? `• Parts: ${rec.partsReplaced}` : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', fontWeight: 800 }}>
                      {rec.currency} {rec.cost.toLocaleString()}
                    </div>
                    {rec.receiptAttachmentName && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          marginTop: '0.35rem',
                          padding: '0.2rem 0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                        }}
                      >
                        <FileText size={12} /> {rec.receiptAttachmentName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FUEL & CHARGING */}
        {activeTab === 'fuel' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Fuel & Charging Telemetry</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Unified fuel and EV charging consumption tracking with real-world economy analytics.
                </p>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Log Session
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fuelLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {log.type === 'charge' ? 'EV CHARGE' : 'FUEL FILL'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{log.date}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>•</span>
                      <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
                        {log.odometer.toLocaleString()} {log.odometerUnit}
                      </span>
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600 }}>
                      {log.type === 'charge'
                        ? `${log.energyAddedKwh} kWh energy added`
                        : `${log.fuelQuantity} ${log.fuelUnit} ${log.fullTank ? '(Full Tank)' : ''}`}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Station: {log.chargingProvider || 'Fuel Station'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', fontWeight: 800 }}>
                      {log.currency} {log.totalCost.toFixed(2)}
                    </div>
                    {log.calculatedEconomy && (
                      <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.25rem' }}>
                        ⚡ {log.calculatedEconomy}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EXPENSES */}
        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Vehicle Expense Ledger & Analytics</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Real persisted expenses automatically categorized from service history, charging sessions, and custom entries.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={expenseTimeframe}
                  onChange={(e) => setExpenseTimeframe(e.target.value as any)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="year">Current Year</option>
                  <option value="month">Current Month</option>
                </select>

                <button
                  onClick={handleExportCsv}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={15} /> Export CSV
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                        {exp.category}
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{exp.description}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {exp.date} {exp.serviceProvider ? `• ${exp.serviceProvider}` : ''}
                    </div>
                  </div>

                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.05rem' }}>
                    {exp.currency} {exp.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REMINDERS */}
        {activeTab === 'reminders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Proactive Ownership Reminders</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  In-app alerts for maintenance due dates, insurance policies, and annual safety inspections.
                </p>
              </div>

              <button
                onClick={() => setShowReminderModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Add Reminder
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  style={{
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {rem.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>{rem.title}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Due Date: {rem.dueDate} {rem.description ? `• ${rem.description}` : ''}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleReminderComplete(rem.id, userId);
                      setRefreshTrigger((prev) => prev + 1);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: rem.isCompleted ? '#10b981' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <CheckCircle2 size={16} /> {rem.isCompleted ? 'Completed' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: GARAGE SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '640px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Garage & Ownership Preferences
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Customize measurement units and display standards across your ownership hub.
            </p>

            <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  Default Odometer Unit
                </label>
                <select
                  value={settings.preferredOdometerUnit}
                  onChange={(e) => {
                    saveGarageSettings(userId, { ...settings, preferredOdometerUnit: e.target.value as any });
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  Default Currency
                </label>
                <select
                  value={settings.preferredCurrency}
                  onChange={(e) => {
                    saveGarageSettings(userId, { ...settings, preferredCurrency: e.target.value as any });
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SAVED BOOKMARKS (Stage 6) */}
        {activeTab === 'saved' && (
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Saved Catalog Vehicles ({savedVehicles.length})
            </h3>
            {savedVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0c1017', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No catalog vehicles bookmarked yet.</p>
                <Link to="/discover" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {savedVehicles.map((car) => (
                  <div key={car.id} className="car-card">
                    <CarImage src={car.thumbnail} alt={car.model} style={{ height: '180px', objectFit: 'cover' }} />
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {car.brand.toUpperCase()}
                      </div>
                      <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                        {car.model}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Link to={`/cars/${car.slug}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
                          Details
                        </Link>
                        <button
                          onClick={() => {
                            removeCarFromGarage(car.slug);
                            setRefreshTrigger((prev) => prev + 1);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', color: '#f43f5e' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: STUDIO BUILDS (Stage 10) */}
        {activeTab === 'configurations' && (
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Saved Studio Configurations ({savedConfigurations.length})
            </h3>
            {savedConfigurations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0c1017', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No custom 3D studio builds saved yet.</p>
                <Link to="/configurator" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Launch Configurator
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {savedConfigurations.map((cfg) => (
                  <div key={cfg.id} className="car-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        CONFIGURED BUILD
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleShareConfig(cfg)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Share Configuration Link"
                        >
                          {copiedConfigId === cfg.id ? <Check size={13} color="var(--accent-cyan)" /> : <Share2 size={13} />}
                          {copiedConfigId === cfg.id ? 'Copied' : 'Share'}
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(cfg.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#f43f5e' }}
                          title="Delete Configuration"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {editingConfigId === cfg.id ? (
                      <div style={{ display: 'flex', gap: '0.35rem', margin: '0.5rem 0' }}>
                        <input
                          type="text"
                          value={editingConfigName}
                          onChange={(e) => setEditingConfigName(e.target.value)}
                          style={{ flex: 1, padding: '0.25rem 0.5rem', backgroundColor: '#131923', border: '1px solid var(--accent-cyan)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <button onClick={() => handleSaveRename(cfg.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                      </div>
                    ) : (
                      <h4
                        onClick={() => handleStartRename(cfg.id, cfg.customName || cfg.vehicleName)}
                        style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0 0.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        title="Click to rename"
                      >
                        {cfg.customName || cfg.vehicleName}
                        <Edit2 size={12} color="var(--text-secondary)" />
                      </h4>
                    )}

                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.5rem' }}>
                      ${cfg.totalPrice.toLocaleString()}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <Link to={`/configurator/${cfg.vehicleSlug}?variant=${cfg.variantId}&paint=${cfg.paintId}&wheels=${cfg.wheelId}&interior=${cfg.interiorId}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem' }}>
                        Load Studio Build
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddOwnedVehicleModal
          userId={userId}
          isOpen={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          onVehicleAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />

        <LogFuelChargingModal
          userId={userId}
          vehicles={ownedVehicles}
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          onLogAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />

        <AddServiceRecordModal
          userId={userId}
          vehicles={ownedVehicles}
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onRecordAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />

        <ScheduleMaintenanceModal
          userId={userId}
          vehicles={ownedVehicles}
          isOpen={showMaintModal}
          onClose={() => setShowMaintModal(false)}
          onTaskAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />

        <AddReminderModal
          userId={userId}
          vehicles={ownedVehicles}
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          onReminderAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
    </div>
  );
};
