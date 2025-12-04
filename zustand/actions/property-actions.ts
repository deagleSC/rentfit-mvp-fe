import {
  addUnitService,
  getUnitsService,
  getUnitByIdService,
} from "../services/property-services";
import { PropertyState, Unit } from "@/types/property-types";

export const addUnitAction = async (
  unit: Unit,
  set: (
    partial:
      | Partial<PropertyState>
      | ((state: PropertyState) => Partial<PropertyState>)
  ) => void
): Promise<Unit | null> => {
  set({ isAddUnitLoading: true });
  try {
    const result = await addUnitService(unit);
    set({ isAddUnitLoading: false });
    return result;
  } catch {
    set({ isAddUnitLoading: false });
    return null;
  }
};

export const getUnitsAction = async (
  set: (
    partial:
      | Partial<PropertyState>
      | ((state: PropertyState) => Partial<PropertyState>)
  ) => void,
  ownerId: string
): Promise<Unit[] | null> => {
  set({ isUnitsLoading: true });
  try {
    const result = await getUnitsService(ownerId);
    set({ units: result, isUnitsLoading: false });
    return result;
  } catch {
    set({ isUnitsLoading: false });
    return null;
  }
};

export const getUnitByIdAction = async (
  set: (
    partial:
      | Partial<PropertyState>
      | ((state: PropertyState) => Partial<PropertyState>)
  ) => void,
  id: string
): Promise<Unit | null> => {
  set({ isUnitsLoading: true });
  try {
    const result = await getUnitByIdService(id);
    set({ isUnitsLoading: false });
    return result;
  } catch {
    set({ isUnitsLoading: false });
    return null;
  }
};
