import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { City, Country, State } from "@/types/static-types";

export const getCountriesService = async (
  page: number,
  limit: number,
  search: string | null
): Promise<Country[]> => {
  return makeRequest<Country[]>("get", API_ROUTES.GET_COUNTRIES, {
    params: { page, limit, search },
  });
};

export const getStatesService = async (
  page: number,
  limit: number,
  countryId: string,
  search?: string | null
): Promise<State[]> => {
  return makeRequest<State[]>("get", API_ROUTES.GET_STATES, {
    params: { page, limit, countryId, search },
  });
};

export const getCitiesService = async (
  page: number,
  limit: number,
  stateId: string,
  search?: string | null
): Promise<City[]> => {
  return makeRequest<City[]>("get", API_ROUTES.GET_CITIES, {
    params: { page, limit, stateId, search },
  });
};
