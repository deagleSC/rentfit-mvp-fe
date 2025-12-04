import { loginService, signupService } from "@/zustand/services/auth-services";
import type { AuthState } from "@/types/auth-types";
import { User } from "@/types/user-types";

export const loginAction = async (
  email: string,
  password: string,
  set: (
    partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)
  ) => void
) => {
  set({ isLoginLoading: true });
  const response = await loginService(email, password);
  set({
    accessToken: response?.token,
    currentUser: response?.user,
    isLoginLoading: false,
  });
};

export const signupAction = async (
  user: User,
  set: (
    partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)
  ) => void
) => {
  set({ isSignupLoading: true });
  const response = await signupService(user);
  set({
    accessToken: response?.token,
    currentUser: response?.user,
    isSignupLoading: false,
  });
};
