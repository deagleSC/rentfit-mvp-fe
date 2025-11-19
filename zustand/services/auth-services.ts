import { API_ROUTES } from "@/config/api";
import { makeRequest } from "@/lib/api-utils";
import { LoginResponse, SignupResponse, User } from "@/types/user-types";

export const loginService = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  return makeRequest<LoginResponse>("post", API_ROUTES.LOGIN, {
    data: { email, password },
  });
};

export const signupService = async (user: User): Promise<SignupResponse> => {
  return makeRequest<SignupResponse>("post", API_ROUTES.SIGNUP, { data: user });
};
