import {
  getTenanciesService,
  GetTenanciesParams,
} from "../services/tenancy-services";
import { Tenancy } from "@/types/tenancy-types";

export interface TenancyState {
  tenancies: Tenancy[];
  isTenanciesLoading: boolean;
}

type SetState = (
  partial:
    | Partial<TenancyState>
    | ((state: TenancyState) => Partial<TenancyState>)
) => void;

export const getTenanciesAction = async (
  set: SetState,
  params?: GetTenanciesParams
): Promise<Tenancy[] | null> => {
  set({ isTenanciesLoading: true });
  try {
    const result = await getTenanciesService(params);
    set({ tenancies: result, isTenanciesLoading: false });
    return result;
  } catch {
    set({ isTenanciesLoading: false });
    return null;
  }
};
