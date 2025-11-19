import { addUnitService } from "../services/property-services";
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
