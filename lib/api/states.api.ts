// dashboard.api.ts
import { API } from "./axios";

export interface StateOverview {
  state: string;
  totalRides: number;
  activeRides: number;
  passengers: number;
  drivers: number;
}

export const getDashboardOverview = async (): Promise<StateOverview[]> => {
  const res = await API.get("/admin/dashboard-overview");

  return (res.data.data || []).map((item: any) => ({
    state: item.state,
    totalRides: item.totalRideCount ?? 0,
    activeRides: item.activeRideCount ?? 0,
    passengers: item.passengerCount ?? 0,
    drivers: item.driverCount ?? 0,
  }));
};


