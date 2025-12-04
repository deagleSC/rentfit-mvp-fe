import { create } from "zustand";
import {
  Agreement,
  CreateAgreementPayload,
  SignAgreementPayload,
} from "@/types/agreement-types";
import {
  createAgreementAction,
  getAgreementByIdAction,
  signAgreementAction,
  getAgreementsAction,
} from "../actions/agreement-actions";
import { GetAgreementsParams } from "../services/agreement-services";

interface AgreementState {
  currentAgreement: Agreement | null;
  agreements: Agreement[];
  isCreating: boolean;
  isSigning: boolean;
  isLoading: boolean;
  isAgreementsLoading: boolean;
  error: string | null;
}

interface AgreementActions {
  createAgreement: (
    payload: CreateAgreementPayload
  ) => Promise<Agreement | null>;
  getAgreementById: (agreementId: string) => Promise<Agreement | null>;
  getAgreements: (params?: GetAgreementsParams) => Promise<Agreement[] | null>;
  signAgreement: (
    agreementId: string,
    payload: SignAgreementPayload
  ) => Promise<Agreement | null>;
  setCurrentAgreement: (agreement: Agreement | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AgreementState = {
  currentAgreement: null,
  agreements: [],
  isCreating: false,
  isSigning: false,
  isLoading: false,
  isAgreementsLoading: false,
  error: null,
};

export const useAgreementStore = create<AgreementState & AgreementActions>(
  (set) => ({
    ...initialState,
    createAgreement: async (payload: CreateAgreementPayload) => {
      return createAgreementAction(payload, set);
    },
    getAgreementById: async (agreementId: string) => {
      return getAgreementByIdAction(agreementId, set);
    },
    getAgreements: async (params?: GetAgreementsParams) => {
      return getAgreementsAction(params, set);
    },
    signAgreement: async (
      agreementId: string,
      payload: SignAgreementPayload
    ) => {
      return signAgreementAction(agreementId, payload, set);
    },
    setCurrentAgreement: (agreement: Agreement | null) =>
      set({ currentAgreement: agreement }),
    clearError: () => set({ error: null }),
    reset: () => set({ ...initialState }),
  })
);
