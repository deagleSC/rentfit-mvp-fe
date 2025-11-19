import {
  getCountriesService,
  getStatesService,
  getCitiesService,
} from "../services/static-services";
import { StaticState } from "@/types/static-types";

export const getCountriesAction = async (
  page: number,
  limit: number,
  search: string | null,
  set: (
    partial:
      | Partial<StaticState>
      | ((state: StaticState) => Partial<StaticState>)
  ) => void
) => {
  set({ isCountriesLoading: true });
  const response = await getCountriesService(page, limit, search);
  set({ countries: response, isCountriesLoading: false });
};

export const getStatesAction = async (
  page: number,
  limit: number,
  countryId: string,
  set: (
    partial:
      | Partial<StaticState>
      | ((state: StaticState) => Partial<StaticState>)
  ) => void,
  search?: string | null
) => {
  set({ isStatesLoading: true });
  const response = await getStatesService(page, limit, countryId, search);
  set({ states: response, isStatesLoading: false });
};

export const getCitiesAction = async (
  page: number,
  limit: number,
  stateId: string,
  set: (
    partial:
      | Partial<StaticState>
      | ((state: StaticState) => Partial<StaticState>)
  ) => void,
  search?: string | null
) => {
  set({ isCitiesLoading: true });
  const response = await getCitiesService(page, limit, stateId, search);
  set({ cities: response, isCitiesLoading: false });
};
