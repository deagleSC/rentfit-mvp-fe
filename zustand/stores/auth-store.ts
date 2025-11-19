import { create } from "zustand";
import { User } from "@/types/user-types";
import { persist } from "zustand/middleware";
import { loginAction, signupAction } from "../actions/auth-actions";
import { AuthState } from "@/types/auth-types";

interface AuthActions {
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (user: User) => void;
}

const initialState: AuthState = {
  accessToken: "",
  currentUser: null,
  isLoginLoading: false,
  isSignupLoading: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      login: async (email: string, password: string) =>
        loginAction(email, password, set),
      logout: () => set({ accessToken: null, currentUser: null }),
      signup: async (user: User) => signupAction(user, set),
    }),
    { name: "auth-store" }
  )
);
