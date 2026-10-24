import type {
  OwnedVehicle,
  MaintenanceTask,
  MaintenanceStatus,
  ServiceRecord,
  FuelChargingLog,
  VehicleExpense,
  OwnershipReminder,
  GarageUserSettings,
} from '../types/ownership';

// LocalStorage Keys
const KEYS = {
  VEHICLES: 'autoverse_owned_vehicles',
  MAINTENANCE: 'autoverse_maintenance_tasks',
  SERVICE_RECORDS: 'autoverse_service_records',
  FUEL_LOGS: 'autoverse_fuel_charging_logs',
  EXPENSES: 'autoverse_expenses',
  REMINDERS: 'autoverse_reminders',
  SETTINGS: 'autoverse_garage_settings',
};

// Safe JSON Helpers
function loadList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return [];
  }
}

function saveList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('autoverse_ownership_updated', { detail: { key } }));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// ----------------------------------------------------
// DEFAULT SETTINGS
// ----------------------------------------------------
export function getGarageSettings(userId: string): GarageUserSettings {
  try {
    const raw = localStorage.getItem(`${KEYS.SETTINGS}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    preferredOdometerUnit: 'km',
    preferredCurrency: 'USD',
    emailNotificationsEnabled: false,
    pushNotificationsEnabled: false,
  };
}

export function saveGarageSettings(userId: string, settings: GarageUserSettings): void {
  localStorage.setItem(`${KEYS.SETTINGS}_${userId}`, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('autoverse_ownership_updated', { detail: { key: KEYS.SETTINGS } }));
}

// ----------------------------------------------------
// 1. OWNED VEHICLES
// ----------------------------------------------------
export function getOwnedVehicles(userId: string): OwnedVehicle[] {
  if (!userId) return [];
  ensureSeedData(userId);
  const all = loadList<OwnedVehicle>(KEYS.VEHICLES);
  return all.filter((v) => v.userId === userId);
}

export function getOwnedVehicleById(id: string, userId: string): OwnedVehicle | null {
  if (!userId || !id) return null;
  const list = getOwnedVehicles(userId);
  return list.find((v) => v.id === id) || null;
}

export function addOwnedVehicle(
  data: Omit<OwnedVehicle, 'id' | 'createdAt' | 'updatedAt'>
): OwnedVehicle {
  const all = loadList<OwnedVehicle>(KEYS.VEHICLES);
  const now = new Date().toISOString();
  const newVehicle: OwnedVehicle = {
    ...data,
    id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newVehicle);
  saveList(KEYS.VEHICLES, all);

  // Generate standard starter maintenance tasks for the new vehicle
  initializeDefaultMaintenance(newVehicle);

  return newVehicle;
}

export function updateOwnedVehicle(
  id: string,
  userId: string,
  updates: Partial<OwnedVehicle>
): OwnedVehicle | null {
  const all = loadList<OwnedVehicle>(KEYS.VEHICLES);
  const idx = all.findIndex((v) => v.id === id && v.userId === userId);
  if (idx === -1) return null;

  const updated: OwnedVehicle = {
    ...all[idx],
    ...updates,
    id: all[idx].id,
    userId: all[idx].userId,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updated;
  saveList(KEYS.VEHICLES, all);
  return updated;
}

export function deleteOwnedVehicle(id: string, userId: string): boolean {
  const all = loadList<OwnedVehicle>(KEYS.VEHICLES);
  const vehicle = all.find((v) => v.id === id && v.userId === userId);
  if (!vehicle) return false;

  // Remove vehicle
  const filtered = all.filter((v) => v.id !== id);
  saveList(KEYS.VEHICLES, filtered);

  // Cascade cleanup for this vehicle
  const maint = loadList<MaintenanceTask>(KEYS.MAINTENANCE).filter((m) => m.ownedVehicleId !== id);
  saveList(KEYS.MAINTENANCE, maint);

  const services = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS).filter((s) => s.ownedVehicleId !== id);
  saveList(KEYS.SERVICE_RECORDS, services);

  const fuels = loadList<FuelChargingLog>(KEYS.FUEL_LOGS).filter((f) => f.ownedVehicleId !== id);
  saveList(KEYS.FUEL_LOGS, fuels);

  const expenses = loadList<VehicleExpense>(KEYS.EXPENSES).filter((e) => e.ownedVehicleId !== id);
  saveList(KEYS.EXPENSES, expenses);

  const reminders = loadList<OwnershipReminder>(KEYS.REMINDERS).filter((r) => r.ownedVehicleId !== id);
  saveList(KEYS.REMINDERS, reminders);

  return true;
}

// ----------------------------------------------------
// 2. MAINTENANCE ENGINE & SCHEDULER
// ----------------------------------------------------
export function calculateMaintenanceStatus(
  currentOdometer: number,
  task: Pick<MaintenanceTask, 'nextDueDate' | 'nextDueOdometer' | 'isCompleted'>
): { status: MaintenanceStatus; reason: string } {
  if (task.isCompleted) {
    return { status: 'completed', reason: 'Task marked as completed' };
  }

  const now = new Date();
  let isDateOverdue = false;
  let isDateDueSoon = false;
  let daysDiff = 999;

  if (task.nextDueDate) {
    const due = new Date(task.nextDueDate);
    daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      isDateOverdue = true;
    } else if (daysDiff <= 14) {
      isDateDueSoon = true;
    }
  }

  let isOdoOverdue = false;
  let isOdoDueSoon = false;
  let odoDiff = 999999;

  if (task.nextDueOdometer && task.nextDueOdometer > 0) {
    odoDiff = task.nextDueOdometer - currentOdometer;
    if (odoDiff <= 0) {
      isOdoOverdue = true;
    } else if (odoDiff <= 500) {
      isOdoDueSoon = true;
    }
  }

  if (isDateOverdue || isOdoOverdue) {
    const reasons: string[] = [];
    if (isDateOverdue) reasons.push(`${Math.abs(daysDiff)} days overdue`);
    if (isOdoOverdue) reasons.push(`${Math.abs(odoDiff)} units past due odometer`);
    return { status: 'overdue', reason: reasons.join(' & ') };
  }

  if (isDateDueSoon || isOdoDueSoon) {
    const reasons: string[] = [];
    if (isDateDueSoon) reasons.push(`Due in ${daysDiff} days`);
    if (isOdoDueSoon) reasons.push(`Due in ${odoDiff} distance units`);
    return { status: 'due', reason: reasons.join(' & ') };
  }

  return {
    status: 'upcoming',
    reason: task.nextDueDate ? `Scheduled for ${task.nextDueDate}` : 'Upcoming routine interval',
  };
}

export function getMaintenanceTasks(userId: string, vehicleId?: string): MaintenanceTask[] {
  if (!userId) return [];
  ensureSeedData(userId);
  let all = loadList<MaintenanceTask>(KEYS.MAINTENANCE).filter((m) => m.userId === userId);
  if (vehicleId) {
    all = all.filter((m) => m.ownedVehicleId === vehicleId);
  }

  // Refresh dynamic statuses based on latest vehicle odometer
  const vehicles = getOwnedVehicles(userId);
  const vMap = new Map(vehicles.map((v) => [v.id, v.currentOdometer]));

  return all.map((task) => {
    const currentOdo = vMap.get(task.ownedVehicleId) || 0;
    const { status, reason } = calculateMaintenanceStatus(currentOdo, task);
    return {
      ...task,
      status,
      statusReason: reason,
    };
  });
}

export function addMaintenanceTask(
  data: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'statusReason'>
): MaintenanceTask {
  const all = loadList<MaintenanceTask>(KEYS.MAINTENANCE);
  const now = new Date().toISOString();
  const newTask: MaintenanceTask = {
    ...data,
    id: `maint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'upcoming',
    createdAt: now,
    updatedAt: now,
  };
  all.push(newTask);
  saveList(KEYS.MAINTENANCE, all);
  return newTask;
}

export function completeMaintenanceTask(
  taskId: string,
  userId: string,
  options?: {
    createServiceRecord?: boolean;
    cost?: number;
    provider?: string;
    partsReplaced?: string;
    odometer?: number;
    notes?: string;
  }
): boolean {
  const all = loadList<MaintenanceTask>(KEYS.MAINTENANCE);
  const idx = all.findIndex((m) => m.id === taskId && m.userId === userId);
  if (idx === -1) return false;

  const task = all[idx];
  const now = new Date().toISOString().split('T')[0];

  task.isCompleted = true;
  task.completedDate = now;
  task.status = 'completed';
  task.statusReason = 'Marked completed by owner';
  task.updatedAt = new Date().toISOString();

  saveList(KEYS.MAINTENANCE, all);

  // If requested, create a matching ServiceRecord without duplication
  if (options?.createServiceRecord) {
    const existingServices = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS);
    const isDuplicate = existingServices.some(
      (s) => s.linkedMaintenanceTaskId === taskId && s.userId === userId
    );

    if (!isDuplicate) {
      const vehicle = getOwnedVehicleById(task.ownedVehicleId, userId);
      const odo = options.odometer || vehicle?.currentOdometer || 0;

      addServiceRecord({
        userId,
        ownedVehicleId: task.ownedVehicleId,
        serviceDate: now,
        odometer: odo,
        odometerUnit: vehicle?.odometerUnit || 'km',
        category: 'routine_service',
        workPerformed: `${task.taskName} (Completed from scheduled maintenance)`,
        partsReplaced: options.partsReplaced || 'N/A',
        serviceProvider: options.provider || task.serviceProvider || 'AutoVerse Certified Partner',
        cost: options.cost ?? (task.estimatedCost || 0),
        currency: task.currency || 'USD',
        notes: options.notes || task.notes || 'Completed scheduled service item.',
        isVerifiedByServiceCenter: false,
        linkedMaintenanceTaskId: taskId,
      });
    }
  }

  return true;
}

export function deleteMaintenanceTask(id: string, userId: string): boolean {
  const all = loadList<MaintenanceTask>(KEYS.MAINTENANCE);
  const filtered = all.filter((m) => !(m.id === id && m.userId === userId));
  saveList(KEYS.MAINTENANCE, filtered);
  return true;
}

// ----------------------------------------------------
// 3. SERVICE HISTORY & RECORDS
// ----------------------------------------------------
export function getServiceRecords(userId: string, vehicleId?: string): ServiceRecord[] {
  if (!userId) return [];
  ensureSeedData(userId);
  let all = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS).filter((s) => s.userId === userId);
  if (vehicleId) {
    all = all.filter((s) => s.ownedVehicleId === vehicleId);
  }
  // Sort latest first
  return all.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
}

export function addServiceRecord(
  data: Omit<ServiceRecord, 'id' | 'createdAt'>
): ServiceRecord {
  const all = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS);
  const now = new Date().toISOString();
  const newRecord: ServiceRecord = {
    ...data,
    id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  };
  all.push(newRecord);
  saveList(KEYS.SERVICE_RECORDS, all);

  // Auto-record expense if cost > 0
  if (data.cost > 0) {
    addExpense({
      userId: data.userId,
      ownedVehicleId: data.ownedVehicleId,
      date: data.serviceDate,
      category: data.category === 'repairs' ? 'Repairs' : 'Maintenance',
      description: `${data.workPerformed} (${data.serviceProvider})`,
      amount: data.cost,
      currency: data.currency,
      serviceProvider: data.serviceProvider,
      sourceType: 'service_record',
      sourceRecordId: newRecord.id,
    });
  }

  // Update vehicle current odometer if higher
  const vehicle = getOwnedVehicleById(data.ownedVehicleId, data.userId);
  if (vehicle && data.odometer > vehicle.currentOdometer) {
    updateOwnedVehicle(vehicle.id, data.userId, {
      currentOdometer: data.odometer,
      odometerLastUpdated: new Date().toISOString(),
    });
  }

  return newRecord;
}

export function deleteServiceRecord(id: string, userId: string): boolean {
  const all = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS);
  const filtered = all.filter((s) => !(s.id === id && s.userId === userId));
  saveList(KEYS.SERVICE_RECORDS, filtered);

  // Remove matching auto expense
  const expenses = loadList<VehicleExpense>(KEYS.EXPENSES);
  const filteredExp = expenses.filter(
    (e) => !(e.sourceRecordId === id && e.userId === userId)
  );
  saveList(KEYS.EXPENSES, filteredExp);

  return true;
}

// ----------------------------------------------------
// 4. FUEL & EV CHARGING LOG
// ----------------------------------------------------
export function getFuelChargingLogs(userId: string, vehicleId?: string): FuelChargingLog[] {
  if (!userId) return [];
  ensureSeedData(userId);
  let all = loadList<FuelChargingLog>(KEYS.FUEL_LOGS).filter((f) => f.userId === userId);
  if (vehicleId) {
    all = all.filter((f) => f.ownedVehicleId === vehicleId);
  }
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addFuelChargingLog(
  data: Omit<FuelChargingLog, 'id' | 'createdAt' | 'calculatedEconomy'>
): FuelChargingLog {
  const all = loadList<FuelChargingLog>(KEYS.FUEL_LOGS);
  const now = new Date().toISOString();

  // Find previous record to compute metrics
  const previousLogs = all
    .filter((f) => f.ownedVehicleId === data.ownedVehicleId && f.userId === data.userId)
    .sort((a, b) => b.odometer - a.odometer);

  let calculatedEconomy: string | undefined = undefined;

  if (previousLogs.length > 0) {
    const prev = previousLogs[0];
    const distanceDelta = data.odometer - prev.odometer;

    if (distanceDelta > 0) {
      if (data.type === 'fuel' && data.fuelQuantity && data.fuelQuantity > 0) {
        if (data.odometerUnit === 'mi' && data.fuelUnit === 'gallons') {
          const mpg = (distanceDelta / data.fuelQuantity).toFixed(1);
          calculatedEconomy = `${mpg} MPG`;
        } else if (data.odometerUnit === 'km' && data.fuelUnit === 'liters') {
          const lPer100 = ((data.fuelQuantity / distanceDelta) * 100).toFixed(1);
          calculatedEconomy = `${lPer100} L/100km`;
        } else {
          // Cross-unit conversions
          const km = data.odometerUnit === 'mi' ? distanceDelta * 1.60934 : distanceDelta;
          const liters = data.fuelUnit === 'gallons' ? data.fuelQuantity * 3.78541 : data.fuelQuantity;
          const lPer100 = ((liters / km) * 100).toFixed(1);
          calculatedEconomy = `${lPer100} L/100km`;
        }
      } else if (data.type === 'charge' && data.energyAddedKwh && data.energyAddedKwh > 0) {
        const distPerKwh = (distanceDelta / data.energyAddedKwh).toFixed(2);
        calculatedEconomy = `${distPerKwh} ${data.odometerUnit}/kWh`;
      }
    }
  }

  const newLog: FuelChargingLog = {
    ...data,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    calculatedEconomy,
    createdAt: now,
  };

  all.push(newLog);
  saveList(KEYS.FUEL_LOGS, all);

  // Auto-record expense
  if (data.totalCost > 0) {
    addExpense({
      userId: data.userId,
      ownedVehicleId: data.ownedVehicleId,
      date: data.date,
      category: data.type === 'charge' ? 'EV Charging' : 'Fuel',
      description:
        data.type === 'charge'
          ? `EV Charging ${data.energyAddedKwh ? `(${data.energyAddedKwh} kWh)` : ''} - ${data.chargingLocation || 'Public'}`
          : `Fuel Fill-up ${data.fuelQuantity ? `(${data.fuelQuantity} ${data.fuelUnit || 'L'})` : ''}`,
      amount: data.totalCost,
      currency: data.currency,
      serviceProvider: data.chargingProvider || 'Fuel Station',
      sourceType: 'fuel_log',
      sourceRecordId: newLog.id,
    });
  }

  // Update vehicle current odometer if higher
  const vehicle = getOwnedVehicleById(data.ownedVehicleId, data.userId);
  if (vehicle && data.odometer > vehicle.currentOdometer) {
    updateOwnedVehicle(vehicle.id, data.userId, {
      currentOdometer: data.odometer,
      odometerLastUpdated: new Date().toISOString(),
    });
  }

  return newLog;
}

export function deleteFuelChargingLog(id: string, userId: string): boolean {
  const all = loadList<FuelChargingLog>(KEYS.FUEL_LOGS);
  const filtered = all.filter((f) => !(f.id === id && f.userId === userId));
  saveList(KEYS.FUEL_LOGS, filtered);

  // Clean auto expense
  const expenses = loadList<VehicleExpense>(KEYS.EXPENSES);
  const filteredExp = expenses.filter(
    (e) => !(e.sourceRecordId === id && e.userId === userId)
  );
  saveList(KEYS.EXPENSES, filteredExp);

  return true;
}

// ----------------------------------------------------
// 5. EXPENSES ENGINE
// ----------------------------------------------------
export function getExpenses(
  userId: string,
  vehicleId?: string,
  dateRange?: { start?: string; end?: string }
): VehicleExpense[] {
  if (!userId) return [];
  ensureSeedData(userId);
  let all = loadList<VehicleExpense>(KEYS.EXPENSES).filter((e) => e.userId === userId);
  if (vehicleId) {
    all = all.filter((e) => e.ownedVehicleId === vehicleId);
  }
  if (dateRange?.start) {
    all = all.filter((e) => e.date >= dateRange.start!);
  }
  if (dateRange?.end) {
    all = all.filter((e) => e.date <= dateRange.end!);
  }
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addExpense(
  data: Omit<VehicleExpense, 'id' | 'createdAt'>
): VehicleExpense {
  const all = loadList<VehicleExpense>(KEYS.EXPENSES);
  const now = new Date().toISOString();
  const newExp: VehicleExpense = {
    ...data,
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  };
  all.push(newExp);
  saveList(KEYS.EXPENSES, all);
  return newExp;
}

export function deleteExpense(id: string, userId: string): boolean {
  const all = loadList<VehicleExpense>(KEYS.EXPENSES);
  const filtered = all.filter((e) => !(e.id === id && e.userId === userId));
  saveList(KEYS.EXPENSES, filtered);
  return true;
}

export function exportExpensesCsv(userId: string, vehicleId?: string): string {
  const list = getExpenses(userId, vehicleId);
  const headers = ['Date', 'Vehicle', 'Category', 'Description', 'Amount', 'Currency', 'Provider', 'Source'];
  const vehicles = getOwnedVehicles(userId);
  const vMap = new Map(vehicles.map((v) => [v.id, `${v.year} ${v.make} ${v.model}`]));

  const rows = list.map((e) => [
    e.date,
    `"${vMap.get(e.ownedVehicleId) || 'Unknown'}"`,
    `"${e.category}"`,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    e.currency,
    `"${(e.serviceProvider || '').replace(/"/g, '""')}"`,
    e.sourceType,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ----------------------------------------------------
// 6. REMINDERS & NOTIFICATIONS
// ----------------------------------------------------
export function getReminders(userId: string, vehicleId?: string): OwnershipReminder[] {
  if (!userId) return [];
  ensureSeedData(userId);
  let all = loadList<OwnershipReminder>(KEYS.REMINDERS).filter((r) => r.userId === userId);
  if (vehicleId) {
    all = all.filter((r) => r.ownedVehicleId === vehicleId);
  }
  return all.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function addReminder(
  data: Omit<OwnershipReminder, 'id' | 'createdAt' | 'isRead'>
): OwnershipReminder {
  const all = loadList<OwnershipReminder>(KEYS.REMINDERS);
  const now = new Date().toISOString();
  const newReminder: OwnershipReminder = {
    ...data,
    id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isRead: false,
    createdAt: now,
  };
  all.push(newReminder);
  saveList(KEYS.REMINDERS, all);
  return newReminder;
}

export function toggleReminderComplete(id: string, userId: string): boolean {
  const all = loadList<OwnershipReminder>(KEYS.REMINDERS);
  const idx = all.findIndex((r) => r.id === id && r.userId === userId);
  if (idx === -1) return false;
  all[idx].isCompleted = !all[idx].isCompleted;
  saveList(KEYS.REMINDERS, all);
  return true;
}

export function deleteReminder(id: string, userId: string): boolean {
  const all = loadList<OwnershipReminder>(KEYS.REMINDERS);
  const filtered = all.filter((r) => !(r.id === id && r.userId === userId));
  saveList(KEYS.REMINDERS, filtered);
  return true;
}

// ----------------------------------------------------
// 7. DEFAULT MAINTENANCE GENERATOR
// ----------------------------------------------------
function initializeDefaultMaintenance(vehicle: OwnedVehicle): void {
  const all = loadList<MaintenanceTask>(KEYS.MAINTENANCE);
  const now = new Date();

  // Helper to format date + months
  const addMonths = (m: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().split('T')[0];
  };

  const tasksToSeed: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'statusReason'>[] = [];

  if (vehicle.powertrain === 'Electric') {
    tasksToSeed.push(
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'High-Voltage Battery & Cooling Loop Diagnostic',
        category: 'ev_charging_system',
        notes: 'Manufacturer thermal coolant resistance & cell capacity balance test',
        lastServiceDate: now.toISOString().split('T')[0],
        lastServiceOdometer: vehicle.currentOdometer,
        nextDueDate: addMonths(6),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 7500 : 12000),
        estimatedCost: 180,
        currency: vehicle.currency,
        serviceProvider: `${vehicle.make} Authorized Center`,
        reminderEnabled: true,
        isCompleted: false,
      },
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'Brake Fluid Moisture Inspection & Regenerative System Test',
        category: 'brake_inspection',
        notes: 'Check hydraulic moisture content & caliper slider free play',
        nextDueDate: addMonths(12),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 12000 : 20000),
        estimatedCost: 120,
        currency: vehicle.currency,
        serviceProvider: `${vehicle.make} Certified Tech`,
        reminderEnabled: true,
        isCompleted: false,
      },
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'Tyre Tread Depth & High-Torque Wear Balance',
        category: 'tyre_rotation',
        notes: 'EV weight bias rotation and laser four-wheel alignment',
        nextDueDate: addMonths(3),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 5000 : 8000),
        estimatedCost: 85,
        currency: vehicle.currency,
        serviceProvider: 'Performance Tyre Care',
        reminderEnabled: true,
        isCompleted: false,
      }
    );
  } else {
    // ICE or Hybrid
    tasksToSeed.push(
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'Synthetic Engine Oil & Filter Replacement',
        category: 'oil_change',
        notes: 'Full synthetic low-viscosity OEM spec with drain plug washer replacement',
        lastServiceDate: now.toISOString().split('T')[0],
        lastServiceOdometer: vehicle.currentOdometer,
        nextDueDate: addMonths(6),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 5000 : 10000),
        estimatedCost: 140,
        currency: vehicle.currency,
        serviceProvider: `${vehicle.make} Service Center`,
        reminderEnabled: true,
        isCompleted: false,
      },
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'Brake Pad Thickness & Rotor Lateral Runout Inspection',
        category: 'brake_inspection',
        notes: 'Measure front/rear friction lining thickness and rotor surface grooving',
        nextDueDate: addMonths(9),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 10000 : 15000),
        estimatedCost: 95,
        currency: vehicle.currency,
        serviceProvider: 'Apex Precision Brakes',
        reminderEnabled: true,
        isCompleted: false,
      },
      {
        userId: vehicle.userId,
        ownedVehicleId: vehicle.id,
        taskName: 'Tyre Rotation & High-Speed Dynamic Balancing',
        category: 'tyre_rotation',
        notes: 'Cross-pattern rotation to ensure even shoulder wear',
        nextDueDate: addMonths(4),
        nextDueOdometer: vehicle.currentOdometer + (vehicle.odometerUnit === 'mi' ? 6000 : 10000),
        estimatedCost: 60,
        currency: vehicle.currency,
        serviceProvider: 'Continental Tyre Lounge',
        reminderEnabled: true,
        isCompleted: false,
      }
    );
  }

  tasksToSeed.forEach((t) => {
    all.push({
      ...t,
      id: `maint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'upcoming',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  saveList(KEYS.MAINTENANCE, all);
}

// ----------------------------------------------------
// 8. SEED REALISTIC STARTER DATA FOR DEMO USER
// ----------------------------------------------------
function ensureSeedData(userId: string): void {
  const existing = loadList<OwnedVehicle>(KEYS.VEHICLES);
  const userVehicles = existing.filter((v) => v.userId === userId);
  if (userVehicles.length > 0) return; // User already has records

  // Only seed for demo or main user to give an instant impressive experience
  const now = new Date();
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const past60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const seedCarId = `veh_seed_${Date.now()}`;
  const seedVehicle: OwnedVehicle = {
    id: seedCarId,
    userId,
    vehicleSlug: 'porsche-taycan-turbo-s',
    isCustom: false,
    make: 'Porsche',
    model: 'Taycan Turbo S',
    variant: 'AWD Dual Motor Performance',
    year: 2024,
    powertrain: 'Electric',
    nickname: 'Silver Apex',
    color: 'Frozen Blue Metallic',
    currentOdometer: 14250,
    odometerUnit: 'km',
    odometerLastUpdated: now.toISOString(),
    purchaseDate: '2024-03-15',
    purchasePrice: 209000,
    currency: 'USD',
    photoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    notes: 'Primary weekend performance grand tourer. Fitted with Mission E Design wheels.',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  existing.push(seedVehicle);
  saveList(KEYS.VEHICLES, existing);

  // Seed Maintenance Tasks
  const maints = loadList<MaintenanceTask>(KEYS.MAINTENANCE);
  maints.push(
    {
      id: `maint_seed_1_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      taskName: '800V High-Voltage Battery Health & Cell Diagnostics',
      category: 'ev_charging_system',
      notes: 'Porsche Center verified battery capacity at 99.4% retention.',
      lastServiceDate: past60Days,
      lastServiceOdometer: 11800,
      nextDueDate: next90Days,
      nextDueOdometer: 18000,
      status: 'upcoming',
      estimatedCost: 220,
      currency: 'USD',
      serviceProvider: 'Porsche Motorsport Studio',
      reminderEnabled: true,
      isCompleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `maint_seed_2_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      taskName: 'Pirelli P-Zero Elect Tyre Inspection & Alignment',
      category: 'tyre_rotation',
      notes: 'Front right tyre showing slightly higher inner shoulder wear.',
      nextDueDate: next30Days,
      nextDueOdometer: 14500,
      status: 'due',
      estimatedCost: 95,
      currency: 'USD',
      serviceProvider: 'Apex Performance Garage',
      reminderEnabled: true,
      isCompleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  );
  saveList(KEYS.MAINTENANCE, maints);

  // Seed Service Record
  const services = loadList<ServiceRecord>(KEYS.SERVICE_RECORDS);
  const srvId = `srv_seed_1_${Date.now()}`;
  services.push({
    id: srvId,
    userId,
    ownedVehicleId: seedCarId,
    serviceDate: past60Days,
    odometer: 11800,
    odometerUnit: 'km',
    category: 'routine_service',
    workPerformed: 'First Scheduled Inspection & High-Voltage System Diagnostics',
    partsReplaced: 'Cabin HEPA Filter, Wiper Blades',
    serviceProvider: 'Porsche Center Stuttgart South',
    cost: 340,
    currency: 'USD',
    nextServiceRecommendation: '18,000 km Brake Fluid Hydration Check',
    notes: 'All control units updated to latest software release.',
    receiptAttachmentName: 'Porsche_Official_Inspection_Invoice_04.pdf',
    receiptAttachmentSize: 245000,
    isVerifiedByServiceCenter: true,
    createdAt: now.toISOString(),
  });
  saveList(KEYS.SERVICE_RECORDS, services);

  // Seed Fuel/Charging Log
  const fuels = loadList<FuelChargingLog>(KEYS.FUEL_LOGS);
  const chgId = `chg_seed_1_${Date.now()}`;
  fuels.push(
    {
      id: `chg_seed_0_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      date: past60Days,
      odometer: 13800,
      odometerUnit: 'km',
      type: 'charge',
      energyAddedKwh: 68.5,
      chargingLocation: 'public',
      chargingProvider: 'Ionity Ultra-Fast 350kW',
      totalCost: 48,
      currency: 'USD',
      notes: '10% to 80% state of charge in 18 minutes.',
      calculatedEconomy: '3.6 km/kWh',
      createdAt: now.toISOString(),
    },
    {
      id: chgId,
      userId,
      ownedVehicleId: seedCarId,
      date: past30Days,
      odometer: 14250,
      odometerUnit: 'km',
      type: 'charge',
      energyAddedKwh: 72.0,
      chargingLocation: 'home',
      chargingProvider: 'Porsche Mobile Charger Connect (11kW)',
      totalCost: 18.5,
      currency: 'USD',
      notes: 'Off-peak overnight charging cycle.',
      calculatedEconomy: '3.8 km/kWh',
      createdAt: now.toISOString(),
    }
  );
  saveList(KEYS.FUEL_LOGS, fuels);

  // Seed Expenses
  const expenses = loadList<VehicleExpense>(KEYS.EXPENSES);
  expenses.push(
    {
      id: `exp_seed_1_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      date: past60Days,
      category: 'Maintenance',
      description: 'First Scheduled Inspection & High-Voltage System Diagnostics',
      amount: 340,
      currency: 'USD',
      serviceProvider: 'Porsche Center Stuttgart South',
      sourceType: 'service_record',
      sourceRecordId: srvId,
      createdAt: now.toISOString(),
    },
    {
      id: `exp_seed_2_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      date: past30Days,
      category: 'EV Charging',
      description: 'EV Charging (72 kWh) - Home Wallbox',
      amount: 18.5,
      currency: 'USD',
      serviceProvider: 'Home Grid',
      sourceType: 'fuel_log',
      sourceRecordId: chgId,
      createdAt: now.toISOString(),
    },
    {
      id: `exp_seed_3_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      date: '2024-04-01',
      category: 'Insurance',
      description: 'Annual Comprehensive High-Value Vehicle Insurance',
      amount: 2200,
      currency: 'USD',
      serviceProvider: 'Allianz Prestige Auto',
      sourceType: 'manual',
      createdAt: now.toISOString(),
    }
  );
  saveList(KEYS.EXPENSES, expenses);

  // Seed Reminders
  const reminders = loadList<OwnershipReminder>(KEYS.REMINDERS);
  reminders.push(
    {
      id: `rem_seed_1_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      title: 'Pirelli P-Zero Elect Tyre Check & Balancing',
      type: 'tyre_check',
      dueDate: next30Days,
      dueOdometer: 14500,
      description: 'Rotate front and rear tyres to maximize longevity',
      enabled: true,
      isRead: false,
      isCompleted: false,
      createdAt: now.toISOString(),
    },
    {
      id: `rem_seed_2_${Date.now()}`,
      userId,
      ownedVehicleId: seedCarId,
      title: 'Annual State Vehicle Safety Inspection Renewal',
      type: 'registration',
      dueDate: next90Days,
      description: 'Official emissions exemption and brake testing verification',
      enabled: true,
      isRead: false,
      isCompleted: false,
      createdAt: now.toISOString(),
    }
  );
  saveList(KEYS.REMINDERS, reminders);
}
