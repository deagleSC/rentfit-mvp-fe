import { User } from "./user-types";

export interface AuthState {
  accessToken: string | null;
  currentUser: User | null;
  isLoginLoading: boolean;
  isSignupLoading: boolean;
}
