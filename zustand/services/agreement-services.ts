import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import {
  Agreement,
  CreateAgreementPayload,
  SignAgreementPayload,
} from "@/types/agreement-types";
import { useAuthStore } from "@/zustand/stores/auth-store";

export interface CreateAgreementResponse {
  agreement: Agreement;
}

export interface SignAgreementResponse {
  agreement: Agreement;
}

export const createAgreementService = async (
  payload: CreateAgreementPayload
): Promise<Agreement | null> => {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await makeRequest<CreateAgreementResponse>(
    "post",
    API_ROUTES.CREATE_AGREEMENT,
    {
      data: payload,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return response?.agreement || null;
};

export const getAgreementByIdService = async (
  agreementId: string
): Promise<Agreement | null> => {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await makeRequest<{ agreement: Agreement }>(
    "get",
    API_ROUTES.GET_AGREEMENT_BY_ID(agreementId),
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return response?.agreement || null;
};

export const signAgreementService = async (
  agreementId: string,
  payload: SignAgreementPayload
): Promise<Agreement | null> => {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await makeRequest<SignAgreementResponse>(
    "post",
    API_ROUTES.SIGN_AGREEMENT(agreementId),
    {
      data: payload,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return response?.agreement || null;
};

export interface GetAgreementsParams {
  tenancyId?: string;
  tenantId?: string;
  status?: "draft" | "pending_signature" | "signed" | "cancelled";
  page?: number;
  limit?: number;
}

export const getAgreementsService = async (
  params?: GetAgreementsParams
): Promise<Agreement[]> => {
  const accessToken = useAuthStore.getState().accessToken;

  return makeRequest<Agreement[]>("get", API_ROUTES.GET_AGREEMENTS, {
    params,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
};
