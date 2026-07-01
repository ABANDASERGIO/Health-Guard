"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminApi } from "@/lib/api-client";

export type HospitalRecord = {
  id: string;
  name: string;
  region: string;
  beds: number;
  status: "active" | "maintenance";
  address: string;
  email: string;
  phone: string;
  licenseCode: string;
};

async function fetchHospitals(page = 1, limit = 50): Promise<HospitalRecord[]> {
  const res = await adminApi.getHospitals(page, limit);
  // admin API responds with { data: T, ... } plus paginated wrapper from sendPaginated.
  // We try a few common shapes.
  // sendPaginated format: { success, data: { items: T[], pagination: ... }, statusCode }
  const items = (res as any)?.data?.items;
  if (Array.isArray(items)) return items as HospitalRecord[];
  // fallback if the backend implementation differs
  const fallback = (res as any)?.data?.data ?? (res as any)?.data;
  if (Array.isArray(fallback)) return fallback as HospitalRecord[];
  return [];
}






interface HospitalsState {
   hospitals: HospitalRecord[];
   setHospitals: (rows: HospitalRecord[]) => void;
   fetchHospitals: (page?: number, limit?: number) => Promise<void>;
   upsertHospital: (h: HospitalRecord) => Promise<void>;
   removeHospital: (id: string) => Promise<void>;
 }


export const useHospitalsStore = create<HospitalsState>()(
  persist(
    (set) => ({
      hospitals: [],


      setHospitals: (rows) => set({ hospitals: rows }),

      fetchHospitals: async (page = 1, limit = 50) => {
        const rows = await fetchHospitals(page, limit);
        set({ hospitals: rows });
      },

      upsertHospital: async (h) => {
        await adminApi.createHospital(h as any);
        // Refresh list to stay consistent.
        const rows = await fetchHospitals(1, 50);
        set({ hospitals: rows });
      },

      removeHospital: async (id) => {
        await adminApi.deleteHospital(id);
        set((state) => ({ hospitals: state.hospitals.filter((x) => x.id !== id) }));
      },

    }),
    { name: "spms-hospitals" }
  )
);


