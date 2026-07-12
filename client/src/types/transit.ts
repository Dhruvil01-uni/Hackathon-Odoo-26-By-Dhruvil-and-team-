export type UserRole =
  | "FLEET_MANAGER"
  | "DRIVER"
  | "SAFETY_OFFICER"
  | "FINANCIAL_ANALYST";

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Vehicle = {
  id: string;
  registration: string;
  name: string;
  type: string;
  region: string;
  capacity: number;
  odometer: number;
  purchaseCost: number;
  status: VehicleStatus;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  expiryDate: string;
  safetyScore: number;
  status: DriverStatus;
};

export type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  cargoWeight: number;
  distance: number;
  revenue?: number;
  finalOdometer?: number;
  fuelConsumed?: number;
  status: TripStatus;
  vehicle?: Vehicle;
  driver?: Driver;
};

export type MaintenanceRecord = {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  vehicle?: Vehicle;
};

export type FuelLog = {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  mileage: number;
  loggedAt: string;
  vehicle?: Vehicle;
};

export type Expense = {
  id: string;
  vehicleId: string;
  category: string;
  amount: number;
  notes?: string;
  expenseDate: string;
  vehicle?: Vehicle;
};

export type DashboardData = {
  kpis: {
    totalVehicles: number;
    activeVehicles: number;
    availableVehicles: number;
    vehiclesInMaintenance: number;
    activeTrips: number;
    pendingTrips: number;
    driversOnDuty: number;
    fleetUtilization: number;
  };
  breakdowns: {
    vehicleTypes: Array<{ type: string; count: number }>;
    regions: Array<{ region: string; count: number }>;
    statuses: Array<{ status: VehicleStatus; count: number }>;
  };
};

export type ReportsData = {
  summary: {
    vehicleCount: number;
    totalDistance: number;
    totalFuelLiters: number;
    fuelCost: number;
    maintenanceCost: number;
    expenseCost: number;
    operationalCost: number;
    revenue: number;
    averageFuelEfficiency: number;
  };
  vehicles: Array<{
    vehicleId: string;
    registration: string;
    name: string;
    type: string;
    region: string;
    status: VehicleStatus;
    acquisitionCost: number;
    totalDistance: number;
    totalFuelLiters: number;
    fuelCost: number;
    maintenanceCost: number;
    expenseCost: number;
    operationalCost: number;
    revenue: number;
    fuelEfficiency: number;
    roi: number | null;
  }>;
};
