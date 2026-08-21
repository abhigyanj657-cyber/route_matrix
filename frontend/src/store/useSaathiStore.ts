import { create } from 'zustand';
import { VehicleTrip, LTLDemand, ConsolidatedTrip, User, DriverRosterItem } from '../types';
import * as api from '../api';

interface SaathiState {
  activeTrips: VehicleTrip[];
  pendingDemands: LTLDemand[];
  users: User[];
  driverRosters: DriverRosterItem[];
  selectedTrip: VehicleTrip | null;
  consolidatedTrip: ConsolidatedTrip | null;
  activeRole: 'dispatcher' | 'shipper' | 'driver' | 'compliance';
  isLoading: boolean;
  isOptimizing: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | null;

  // Actions
  setActiveRole: (role: 'dispatcher' | 'shipper' | 'driver' | 'compliance') => void;
  setSelectedTrip: (trip: VehicleTrip | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  loadInitialData: () => Promise<void>;
  loadDriverRosters: () => Promise<void>;
  optimizeSelectedTrip: () => Promise<void>;
  addNewDemand: (payload: any) => Promise<void>;
  publishNewTrip: (payload: any) => Promise<void>;
  resetScenario: () => Promise<void>;
}

export const useSaathiStore = create<SaathiState>((set, get) => ({
  activeTrips: [],
  pendingDemands: [],
  users: [],
  driverRosters: [],
  selectedTrip: null,
  consolidatedTrip: null,
  activeRole: 'dispatcher',
  isLoading: false,
  isOptimizing: false,
  toastMessage: null,
  toastType: null,

  setActiveRole: (role) => set({ activeRole: role }),
  setSelectedTrip: (trip) => {
    set({ selectedTrip: trip });
    if (trip) {
      api.fetchConsolidatedTrip(trip.id).then((ct) => set({ consolidatedTrip: ct }));
    } else {
      set({ consolidatedTrip: null });
    }
  },

  showToast: (msg, type = 'info') => {
    set({ toastMessage: msg, toastType: type });
    setTimeout(() => {
      set({ toastMessage: null, toastType: null });
    }, 4500);
  },

  clearToast: () => set({ toastMessage: null, toastType: null }),

  loadDriverRosters: async () => {
    try {
      const rosters = await api.fetchDriverRosters();
      set({ driverRosters: rosters });
    } catch (e) {
      console.error('Failed to load rosters', e);
    }
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const [trips, demands, users, rosters] = await Promise.all([
        api.fetchActiveTrips(),
        api.fetchPendingDemands(),
        api.fetchUsers(),
        api.fetchDriverRosters()
      ]);
      set({ activeTrips: trips, pendingDemands: demands, users: users, driverRosters: rosters });
      
      if (trips.length > 0) {
        const firstTrip = trips[0];
        set({ selectedTrip: firstTrip });
        const ct = await api.fetchConsolidatedTrip(firstTrip.id);
        set({ consolidatedTrip: ct });
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      get().showToast('Could not load backend data. Please ensure backend is running.', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  optimizeSelectedTrip: async () => {
    const trip = get().selectedTrip;
    if (!trip) return;
    set({ isOptimizing: true });
    try {
      const ct = await api.runTripOptimization(trip.id);
      set({ consolidatedTrip: ct });
      const demands = await api.fetchPendingDemands();
      set({ pendingDemands: demands });
      get().showToast(
        `Optimized! Pooled ${ct.demand_ids.length} MSME loads with ${ct.detour_pct}% detour and ${ct.empty_km_saved} km saved!`,
        'success'
      );
    } catch (err: any) {
      console.error('Optimization error:', err);
      get().showToast(`Optimization failed: ${err.message}`, 'error');
    } finally {
      set({ isOptimizing: false });
    }
  },

  addNewDemand: async (payload) => {
    try {
      await api.createLTLDemand(payload);
      const demands = await api.fetchPendingDemands();
      set({ pendingDemands: demands });
      get().showToast('New LTL Freight posted successfully to corridor pool!', 'success');
    } catch (err: any) {
      get().showToast(`Failed to post freight: ${err.message}`, 'error');
    }
  },

  publishNewTrip: async (payload) => {
    try {
      const newTrip = await api.publishVehicleTrip(payload);
      const trips = await api.fetchActiveTrips();
      set({ activeTrips: trips, selectedTrip: newTrip });
      get().showToast('Truck route & spare capacity published!', 'success');
    } catch (err: any) {
      get().showToast(`Failed to publish trip: ${err.message}`, 'error');
    }
  },

  resetScenario: async () => {
    set({ isLoading: true });
    try {
      await api.resetSeedData();
      await get().loadInitialData();
      get().showToast('Corridor scenario reset to fresh Pan-India demo state!', 'success');
    } catch (err: any) {
      get().showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      set({ isLoading: false });
    }
  }
}));
