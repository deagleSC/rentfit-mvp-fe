import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PropertyActions, PropertyState, Unit } from "@/types/property-types";
import { addUnitAction } from "../actions/property-actions";

const initialState: PropertyState = {
  units: [],
  isUnitsLoading: false,
  isAddUnitLoading: false,
};

export const usePropertyStore = create<PropertyState & PropertyActions>()(
  persist(
    (set) => ({
      ...initialState,
      addUnit: async (unit: Unit) => addUnitAction(unit, set),
    }),
    { name: "property-store" }
  )
);
