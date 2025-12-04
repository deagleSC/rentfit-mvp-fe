import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StaticActions, StaticState } from "@/types/static-types";
import {
  getCountriesAction,
  getStatesAction,
  getCitiesAction,
} from "../actions/static-actions";

const initialState: StaticState = {
  countries: [],
  states: [],
  cities: [],
  isCountriesLoading: false,
  isStatesLoading: false,
  isCitiesLoading: false,
};

export const useStaticStore = create<StaticState & StaticActions>()(
  persist(
    (set) => ({
      ...initialState,
      getCountries: async (
        page: number,
        limit: number,
        search: string | null
      ) => getCountriesAction(page, limit, search, set),
      getStates: async (
        page: number,
        limit: number,
        countryId: string,
        search?: string | null
      ) => getStatesAction(page, limit, countryId, set, search),
      getCities: async (
        page: number,
        limit: number,
        stateId: string,
        search?: string | null
      ) => getCitiesAction(page, limit, stateId, set, search),
    }),
    { name: "static-store" }
  )
);
