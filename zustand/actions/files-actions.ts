import { uploadImageService } from "@/zustand/services/files-services";

interface FileUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedFileUrl: string | null;
  error: string | null;
}

type SetState = (
  partial:
    | Partial<FileUploadState>
    | ((state: FileUploadState) => Partial<FileUploadState>)
) => void;

export const uploadImageAction = async (
  file: File,
  folder: string | undefined,
  tags: string[] | undefined,
  set: SetState
): Promise<string | null> => {
  set({ isUploading: true, uploadProgress: 0, error: null });

  try {
    // Simulate progress (since we don't have actual progress from the API)
    set({ uploadProgress: 30 });

    const imageUrl = await uploadImageService(file, folder, tags);

    set({ uploadProgress: 100 });

    if (imageUrl) {
      set({
        uploadedFileUrl: imageUrl,
        isUploading: false,
        uploadProgress: 0,
        error: null,
      });
      return imageUrl;
    } else {
      set({
        isUploading: false,
        uploadProgress: 0,
        error: "Failed to upload image",
      });
      return null;
    }
  } catch (error) {
    set({
      isUploading: false,
      uploadProgress: 0,
      error: error instanceof Error ? error.message : "Failed to upload image",
    });
    throw error;
  }
};
