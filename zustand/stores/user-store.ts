import { create } from "zustand";
import { User } from "@/types/user-types";

interface UserState {
  currentUser: User | null;
  isUpdateLoading: boolean;
  error: string | null;
}

interface UserActions {
  setCurrentUser: (user: User | null) => void;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const initialState: UserState = {
  currentUser: null,
  isUpdateLoading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,
  setCurrentUser: (user: User | null) => set({ currentUser: user }),
  updateUser: async (userId: string, userData: Partial<User>) => {
    set({ isUpdateLoading: true, error: null });
    try {
      const { updateUserAction } = await import("../actions/user-actions");
      await updateUserAction(userId, userData, set);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update user",
        isUpdateLoading: false,
      });
    }
  },
  clearError: () => set({ error: null }),
}));
