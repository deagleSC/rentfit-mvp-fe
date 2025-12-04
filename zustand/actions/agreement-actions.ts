import {
  createAgreementService,
  getAgreementByIdService,
  signAgreementService,
  getAgreementsService,
  GetAgreementsParams,
} from "@/zustand/services/agreement-services";
import {
  Agreement,
  CreateAgreementPayload,
  SignAgreementPayload,
} from "@/types/agreement-types";
import { ApiError } from "@/lib/api-utils";

interface AgreementState {
  currentAgreement: Agreement | null;
  agreements: Agreement[];
  isCreating: boolean;
  isSigning: boolean;
  isLoading: boolean;
  isAgreementsLoading: boolean;
  error: string | null;
}

type SetState = (
  partial:
    | Partial<AgreementState>
    | ((state: AgreementState) => Partial<AgreementState>)
) => void;

export const createAgreementAction = async (
  payload: CreateAgreementPayload,
  set: SetState
) => {
  set({ isCreating: true, error: null });

  try {
    const agreement = await createAgreementService(payload);

    if (agreement) {
      set({
        currentAgreement: agreement,
        isCreating: false,
        error: null,
      });
      return agreement;
    } else {
      set({
        isCreating: false,
        error: "Failed to create agreement",
      });
      return null;
    }
  } catch (error) {
    set({
      isCreating: false,
      error:
        error instanceof Error ? error.message : "Failed to create agreement",
    });
    throw error;
  }
};

export const getAgreementByIdAction = async (
  agreementId: string,
  set: SetState
) => {
  set({ isLoading: true, error: null });

  try {
    const agreement = await getAgreementByIdService(agreementId);

    if (agreement) {
      set({
        currentAgreement: agreement,
        isLoading: false,
        error: null,
      });
      return agreement;
    } else {
      // If agreement is null, it likely means a 404 error occurred
      // Throw ApiError so the calling code can handle it properly
      const error = new ApiError("Agreement not found", 404);
      set({
        isLoading: false,
        error: "Agreement not found",
      });
      throw error;
    }
  } catch (error) {
    set({
      isLoading: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch agreement",
    });
    throw error;
  }
};

export const signAgreementAction = async (
  agreementId: string,
  payload: SignAgreementPayload,
  set: SetState
) => {
  set({ isSigning: true, error: null });

  try {
    const agreement = await signAgreementService(agreementId, payload);

    if (agreement) {
      set({
        currentAgreement: agreement,
        isSigning: false,
        error: null,
      });
      return agreement;
    } else {
      set({
        isSigning: false,
        error: "Failed to sign agreement",
      });
      return null;
    }
  } catch (error) {
    set({
      isSigning: false,
      error:
        error instanceof Error ? error.message : "Failed to sign agreement",
    });
    throw error;
  }
};

export const getAgreementsAction = async (
  params: GetAgreementsParams | undefined,
  set: SetState
) => {
  set({ isAgreementsLoading: true, error: null });

  try {
    const agreements = await getAgreementsService(params);

    if (agreements) {
      set({
        agreements,
        isAgreementsLoading: false,
        error: null,
      });
      return agreements;
    } else {
      set({
        isAgreementsLoading: false,
        error: "Failed to fetch agreements",
      });
      return null;
    }
  } catch (error) {
    set({
      isAgreementsLoading: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch agreements",
    });
    throw error;
  }
};
