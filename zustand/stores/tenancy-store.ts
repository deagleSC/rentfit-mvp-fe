import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tenancy } from "@/types/tenancy-types";
import { getTenanciesAction, TenancyState } from "../actions/tenancy-actions";
import { GetTenanciesParams } from "../services/tenancy-services";

interface TenancyActions {
  getTenancies: (params?: GetTenanciesParams) => Promise<Tenancy[] | null>;
}

const initialState: TenancyState = {
  tenancies: [],
  isTenanciesLoading: false,
};

export const useTenancyStore = create<TenancyState & TenancyActions>()(
  persist(
    (set) => ({
      ...initialState,
      getTenancies: async (params?: GetTenanciesParams) =>
        getTenanciesAction(set, params),
    }),
    { name: "tenancy-store" }
  )
);
