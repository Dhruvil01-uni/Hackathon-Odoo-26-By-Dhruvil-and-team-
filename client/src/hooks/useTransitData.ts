import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiData, postApiData } from "@/lib/api";
import type {
  DashboardData,
  Driver,
  Expense,
  FuelLog,
  MaintenanceRecord,
  ReportsData,
  Trip,
  Vehicle,
} from "@/types/transit";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getApiData<DashboardData>("/dashboard"),
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => getApiData<Vehicle[]>("/vehicles"),
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Vehicle>) => postApiData<Vehicle, Partial<Vehicle>>("/vehicles", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: () => getApiData<Driver[]>("/drivers"),
  });
}

export function useAddDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Driver>) => postApiData<Driver, Partial<Driver>>("/drivers", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => getApiData<Trip[]>("/trips"),
  });
}

export function useAddTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Trip>) => postApiData<Trip, Partial<Trip>>("/trips", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: () => getApiData<MaintenanceRecord[]>("/maintenance"),
  });
}

export function useAddMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MaintenanceRecord>) => postApiData<MaintenanceRecord, Partial<MaintenanceRecord>>("/maintenance", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}

export function useFuelLogs() {
  return useQuery({
    queryKey: ["fuel"],
    queryFn: () => getApiData<FuelLog[]>("/fuel"),
  });
}

export function useAddFuelLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FuelLog>) => postApiData<FuelLog, Partial<FuelLog>>("/fuel", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fuel"] }),
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: () => getApiData<Expense[]>("/expenses"),
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Expense>) => postApiData<Expense, Partial<Expense>>("/expenses", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => getApiData<ReportsData>("/reports"),
  });
}
