import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { Tenancy, CreateTenancyPayload } from "@/types/tenancy-types";

export const createTenancyService = async (
  payload: CreateTenancyPayload
): Promise<Tenancy> => {
  return makeRequest<Tenancy>("post", API_ROUTES.CREATE_TENANCY, {
    data: payload,
  });
};

export interface GetTenanciesParams {
  ownerId?: string;
  tenantId?: string;
  unitId?: string;
  status?: "active" | "terminated" | "pendingRenewal";
  page?: number;
  limit?: number;
}

export const getTenanciesService = async (
  params?: GetTenanciesParams
): Promise<Tenancy[]> => {
  return makeRequest<Tenancy[]>("get", API_ROUTES.GET_TENANCIES, {
    params,
  });
};
