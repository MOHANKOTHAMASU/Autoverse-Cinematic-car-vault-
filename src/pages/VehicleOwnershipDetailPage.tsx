import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getOwnedVehicleById,
  updateOwnedVehicle,
  deleteOwnedVehicle,
  getMaintenanceTasks,
  completeMaintenanceTask,
  getServiceRecords,
  getFuelChargingLogs,
  getExpenses,
  getReminders,
  toggleReminderComplete,
} from '../utils/ownershipStore';
import { VEHICLES } from '../data/vehicles';
import type { OwnedVehicle, MaintenanceTask } from '../types/ownership';
import {
  ArrowLeft,
  Wrench,
  Fuel,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Plus,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { LogFuelChargingModal } from '../components/garage/LogFuelChargingModal';
import { AddServiceRecordModal } from '../components/garage/AddServiceRecordModal';
import { ScheduleMaintenanceModal } from '../components/garage/ScheduleMaintenanceModal';
import { AddReminderModal } from '../components/garage/AddReminderModal';

export const VehicleOwnershipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo_user';

  const [vehicle, setVehicle] = useState<OwnedVehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'service' | 'fuel' | 'expenses' | 'reminders'>('overview');
  const [refresh, setRefresh] = useState(0);

  // Quick Odometer Update state
  const [editingOdo, setEditingOdo] = useState(false);
  const [newOdoValue, setNewOdoValue] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    if (id) {
      const v = getOwnedVehicleById(id, userId);
      setVehicle(v);
      if (v) setNewOdoValue(v.currentOdometer.toString());
    }
  }, [id, userId, refresh]);

  if (!vehicle) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Vehicle Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          This vehicle record does not exist or you do not have permission to access it.
        </p>
        <Link to="/garage" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Garage
        </Link>
      </div>
    );
  }

  // Linked Catalog vehicle
  const catalogVehicle = vehicle.vehicleSlug ? VEHICLES.find((v) => v.slug === vehicle.vehicleSlug) : null;

  // Data for this vehicle
  const maintenanceTasks = getMaintenanceTasks(userId, vehicle.id);
  const serviceRecords = getServiceRecords(userId, vehicle.id);
  const fuelLogs = getFuelChargingLogs(userId, vehicle.id);
  const expenses = getExpenses(userId, vehicle.id);
  const reminders = getReminders(userId, vehicle.id);

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleUpdateOdometer = () => {
    const val = parseInt(newOdoValue);
    if (!isNaN(val) && val >= 0) {
      updateOwnedVehicle(vehicle.id, userId, {
        currentOdometer: val,
        odometerLastUpdated: new Date().toISOString(),
      });
      setEditingOdo(false);
      setRefresh((prev) => prev + 1);
    }
  };

  const handleDelete = () => {
    deleteOwnedVehicle(vehicle.id, userId);
    navigate('/garage');
  };

  const handleCompleteTask = (task: MaintenanceTask) => {
    completeMaintenanceTask(task.id, userId, {
      createServiceRecord: true,
      cost: task.estimatedCost,
      provider: task.serviceProvider,
      odometer: vehicle.currentOdometer,
    });
    setRefresh((prev) => prev + 1);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Link
            to="/garage"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> My Garage
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
        </div>

        {/* Hero Card */}
        <div
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '2rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
            }}
          >
            {/* Image section */}
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={vehicle.photoUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, transparent 50%, #0c1017 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <span className="badge badge-cyan">{vehicle.powertrain.toUpperCase()}</span>
                {vehicle.isCustom ? (
                  <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
                    CUSTOM ENTRY
                  </span>
                ) : (
                  <span className="badge badge-verified">
                    <ShieldCheck size={12} /> CATALOG LINKED
                  </span>
                )}
              </div>
            </div>

            {/* Info details */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {vehicle.make.toUpperCase()}
                  </div>
                  <h1 style={{ fontSize: '2.2rem', color: '#ffffff', fontWeight: 900, lineHeight: 1.1 }}>
                    {vehicle.model}
                  </h1>
                  {vehicle.nickname && (
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      “{vehicle.nickname}”
                    </div>
                  )}
                  {vehicle.variant && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {vehicle.variant}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Link
                    to={`/ownership-calculator?vehicle=${vehicle.vehicleSlug || ''}`}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <Calculator size={14} /> Calculate TCO & Financing
                  </Link>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      backgroundColor: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#f43f5e',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <Trash2 size={14} /> Remove Vehicle
                  </button>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.75rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Current Odometer
                  </div>
                  {editingOdo ? (
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <input
                        type="number"
                        value={newOdoValue}
                        onChange={(e) => setNewOdoValue(e.target.value)}
                        style={{
                          width: '100px',
                          padding: '0.2rem 0.4rem',
                          backgroundColor: '#131923',
                          border: '1px solid var(--accent-cyan)',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                        }}
                      />
                      <button
                        onClick={handleUpdateOdometer}
                        className="btn btn-primary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                      onClick={() => setEditingOdo(true)}
                      title="Click to update odometer"
                    >
                      {vehicle.currentOdometer.toLocaleString()} {vehicle.odometerUnit}
                      <Edit2 size={13} color="var(--accent-cyan)" />
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Model Year
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>{vehicle.year}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Total Expenses
                  </div>
                  <div style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', fontWeight: 800 }}>
                    {vehicle.currency === 'USD' ? '$' : vehicle.currency === 'INR' ? '₹' : '€'}
                    {totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>

                {vehicle.licensePlate && (
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Registration (Private)
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {vehicle.licensePlate}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Fuel size={15} /> Log Fuel / Charge
                </button>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Wrench size={15} /> Add Service Record
                </button>
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Calendar size={15} /> Schedule Task
                </button>
                {catalogVehicle && (
                  <Link
                    to={`/cars/${catalogVehicle.slug}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={14} /> Full Catalog Specs
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'overview' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'overview' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'maintenance' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'maintenance' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'maintenance' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Maintenance ({maintenanceTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('service')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'service' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'service' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'service' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Service Ledger ({serviceRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'fuel' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'fuel' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'fuel' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Fuel & Charging ({fuelLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'expenses' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'expenses' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'expenses' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'reminders' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'reminders' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'reminders' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reminders ({reminders.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Ownership Specifications */}
            <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                Vehicle Specifications & Records
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Powertrain</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{vehicle.powertrain}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Purchase Date</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{vehicle.purchaseDate || 'Not recorded'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Purchase Price</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>
                    {vehicle.purchasePrice ? `${vehicle.currency} ${vehicle.purchasePrice.toLocaleString()}` : 'Private'}
                  </span>
                </div>
                {catalogVehicle && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Catalog Power Output</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {catalogVehicle.horsepower} HP
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>0-60 MPH Benchmarked</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>
                        {catalogVehicle.accelerationSeconds}s
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Drivetrain Architecture</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>
                        {catalogVehicle.drivetrain || catalogVehicle.powertrain}
                      </span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Registered In Garage</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Maintenance Spotlight */}
            <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>
                  Active Maintenance Schedule
                </h3>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              {maintenanceTasks.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                  No active maintenance items scheduled.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {maintenanceTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>{task.taskName}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          {task.statusReason || (task.nextDueDate ? `Due: ${task.nextDueDate}` : 'Routine')}
                        </div>
                      </div>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Scheduled Care & Inspection</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Proactive intervals computed dynamically against current odometer and calendar limits.
                </p>
              </div>
              <button
                onClick={() => setShowMaintModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Schedule Task
              </button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
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
                      <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        {task.taskName}
                      </h4>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {task.statusReason} {task.serviceProvider ? `• ${task.serviceProvider}` : ''}
                    </div>
                    {task.notes && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        Notes: {task.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {task.estimatedCost && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Estimated Cost</div>
                        <div style={{ color: '#ffffff', fontWeight: 700 }}>
                          {task.currency} {task.estimatedCost}
                        </div>
                      </div>
                    )}

                    {!task.isCompleted ? (
                      <button
                        onClick={() => handleCompleteTask(task)}
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

        {/* Service Ledger Tab */}
        {activeTab === 'service' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Verified Service History</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Permanent log of all maintenance, part upgrades, and workshop interventions.
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

            {serviceRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0c1017', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No service records added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {serviceRecords.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      backgroundColor: '#0c1017',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '12px',
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                          Provider: {rec.serviceProvider} {rec.partsReplaced ? `• Parts: ${rec.partsReplaced}` : ''}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fuel & Charging Tab */}
        {activeTab === 'fuel' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Telemetry, Fuel & EV Charging</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Real-world efficiency calculations, energy consumption and expense tracking.
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

            {fuelLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0c1017', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No fuel or charging sessions recorded yet.</p>
              </div>
            ) : (
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
                          ? `${log.energyAddedKwh} kWh added (${log.chargingLocation || 'Public'})`
                          : `${log.fuelQuantity} ${log.fuelUnit} ${log.fullTank ? '(Full Tank)' : ''}`}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Provider: {log.chargingProvider || 'Local Station'} {log.notes ? `• ${log.notes}` : ''}
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
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Vehicle Expense Ledger</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  All costs automatically consolidated across maintenance, charging, fuel, and owner additions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {expenses.map((exp) => (
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

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Vehicle Reminders</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  In-app notifications for upcoming renewal deadlines and scheduled checks.
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
                      setRefresh((prev) => prev + 1);
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 7, 10, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#0c1017',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '480px',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f43f5e', marginBottom: '1rem' }}>
                <AlertTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>Confirm Vehicle Deletion</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Are you sure you want to remove <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> from your garage?
                This action will delete all associated maintenance schedules, service logs, telemetry fill-ups, and expense entries.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.2rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: '#f43f5e',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.6rem 1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <LogFuelChargingModal
          userId={userId}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.id}
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          onLogAdded={() => setRefresh((prev) => prev + 1)}
        />

        <AddServiceRecordModal
          userId={userId}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.id}
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onRecordAdded={() => setRefresh((prev) => prev + 1)}
        />

        <ScheduleMaintenanceModal
          userId={userId}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.id}
          isOpen={showMaintModal}
          onClose={() => setShowMaintModal(false)}
          onTaskAdded={() => setRefresh((prev) => prev + 1)}
        />

        <AddReminderModal
          userId={userId}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.id}
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          onReminderAdded={() => setRefresh((prev) => prev + 1)}
        />
      </div>
    </div>
  );
};
