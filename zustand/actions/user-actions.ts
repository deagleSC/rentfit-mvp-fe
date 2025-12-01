import { updateUserService } from "@/zustand/services/user-services";
import { User } from "@/types/user-types";

interface UserState {
  currentUser: User | null;
  isUpdateLoading: boolean;
  error: string | null;
}

type SetState = (
  partial: Partial<UserState> | ((state: UserState) => Partial<UserState>)
) => void;

export const updateUserAction = async (
  userId: string,
  userData: Partial<User>,
  set: SetState
) => {
  set({ isUpdateLoading: true, error: null });

  try {
    const updatedUser = await updateUserService(userId, userData);

    if (updatedUser) {
      set({
        currentUser: updatedUser,
        isUpdateLoading: false,
        error: null,
      });
    } else {
      set({
        isUpdateLoading: false,
        error: "Failed to update user",
      });
    }
  } catch (error) {
    set({
      isUpdateLoading: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    });
    throw error;
  }
};
