import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PropertyActions, PropertyState, Unit } from "@/types/property-types";
import {
  addUnitAction,
  getUnitsAction,
  getUnitByIdAction,
} from "../actions/property-actions";

const initialState: PropertyState = {
  units: [],
  selectedUnit: null,
  isUnitsLoading: false,
  isAddUnitLoading: false,
};

export const usePropertyStore = create<PropertyState & PropertyActions>()(
  persist(
    (set) => ({
      ...initialState,
      addUnit: async (unit: Unit) => addUnitAction(unit, set),
      getUnits: async (ownerId: string) => getUnitsAction(set, ownerId),
      getUnitById: async (id: string) => getUnitByIdAction(set, id),
      setSelectedUnit: (unit: Unit | null) => set({ selectedUnit: unit }),
    }),
    { name: "property-store" }
  )
);
