import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { User } from "@/types/user-types";
import { useAuthStore } from "@/zustand/stores/auth-store";

export interface UpdateUserResponse {
  user: User;
}

export interface GetUsersParams {
  role?: "tenant" | "landlord" | "admin";
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const updateUserService = async (
  userId: string,
  userData: Partial<User>
): Promise<User | null> => {
  // Get auth token from store
  const accessToken = useAuthStore.getState().accessToken;

  const response = await makeRequest<UpdateUserResponse>(
    "put",
    API_ROUTES.UPDATE_USER(userId),
    {
      data: userData,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return response?.user || null;
};

export const getUsersService = async (
  params?: GetUsersParams
): Promise<User[]> => {
  // Get auth token from store
  const accessToken = useAuthStore.getState().accessToken;

  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const url = `${API_ROUTES.GET_USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  // Backend returns { success: true, data: User[], meta: { pagination: {...} } }
  // makeRequest unwraps it to return User[] directly
  const response = await makeRequest<User[]>("get", url, {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });

  return response || [];
};
