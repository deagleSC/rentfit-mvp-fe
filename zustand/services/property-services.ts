import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { Unit } from "@/types/property-types";

export const addUnitService = async (unit: Unit): Promise<Unit> => {
  return makeRequest<Unit>("post", API_ROUTES.ADD_UNIT, { data: unit });
};
