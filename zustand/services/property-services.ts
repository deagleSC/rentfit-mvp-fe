import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { Unit } from "@/types/property-types";

export const addUnitService = async (unit: Unit): Promise<Unit> => {
  return makeRequest<Unit>("post", API_ROUTES.ADD_UNIT, { data: unit });
};

export const getUnitsService = async (ownerId: string): Promise<Unit[]> => {
  return makeRequest<Unit[]>("get", API_ROUTES.GET_UNITS, {
    params: { ownerId },
  });
};

export const getUnitByIdService = async (id: string): Promise<Unit> => {
  const response = await makeRequest<{ unit: Unit }>(
    "get",
    API_ROUTES.GET_UNIT_BY_ID(id)
  );
  return response?.unit;
};
