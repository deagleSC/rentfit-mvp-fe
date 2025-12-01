import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TenancyWizardActions,
  TenancyWizardState,
} from "@/types/tenancy-types";

const initialState: TenancyWizardState = {
  step: 1,
  selectedUnit: null,
  selectedTenant: null,
  isSubmitting: false,
  formData: null,
  agreementId: null,
};

export const useTenancyWizardStore = create<
  TenancyWizardState & TenancyWizardActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setSelectedUnit: (unit) => set({ selectedUnit: unit }),
      setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
      setFormData: (data) =>
        set({
          formData: {
            ...(get().formData || {
              rent: {
                amount: 0,
                cycle: "monthly",
                dueDateDay: 1,
                utilitiesIncluded: false,
              },
              deposit: {
                amount: 0,
                status: "upcoming",
              },
              clauses: [],
            }),
            ...data,
          },
        }),
      setAgreementId: (agreementId) => set({ agreementId }),
      resetWizard: () => set({ ...initialState }),
    }),
    { name: "tenancy-wizard-store" }
  )
);
