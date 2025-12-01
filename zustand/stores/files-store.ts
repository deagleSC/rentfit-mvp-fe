import { create } from "zustand";

interface FileUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedFileUrl: string | null;
  error: string | null;
}

interface FileUploadActions {
  uploadImage: (
    file: File,
    folder?: string,
    tags?: string[]
  ) => Promise<string | null>;
  clearUploadState: () => void;
  setError: (error: string | null) => void;
}

const initialState: FileUploadState = {
  isUploading: false,
  uploadProgress: 0,
  uploadedFileUrl: null,
  error: null,
};

export const useFilesStore = create<FileUploadState & FileUploadActions>(
  (set) => ({
    ...initialState,
    uploadImage: async (file: File, folder?: string, tags?: string[]) => {
      set({ isUploading: true, uploadProgress: 0, error: null });
      try {
        const { uploadImageAction } = await import("../actions/files-actions");
        const url = await uploadImageAction(file, folder, tags, set);
        return url;
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to upload file",
          isUploading: false,
          uploadProgress: 0,
        });
        return null;
      }
    },
    clearUploadState: () => set({ ...initialState }),
    setError: (error: string | null) => set({ error }),
  })
);
