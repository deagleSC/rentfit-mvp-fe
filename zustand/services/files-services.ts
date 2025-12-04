import { API_ROUTES } from "@/config/api";
import axios from "axios";
import { toast } from "sonner";

export interface UploadImageResponse {
  image: {
    url: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
  };
}

export const uploadImageService = async (
  file: File,
  folder?: string,
  tags?: string[]
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    if (folder) {
      formData.append("folder", folder);
    }

    if (tags && tags.length > 0) {
      formData.append("tags", tags.join(","));
    }

    const response = await axios.post<{
      success: boolean;
      message?: string;
      data: UploadImageResponse;
    }>(API_ROUTES.UPLOAD_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle wrapped response format
    if (response.data && typeof response.data === "object") {
      if (
        "success" in response.data &&
        response.data.success === true &&
        "data" in response.data
      ) {
        return response.data.data.image.url;
      }
      // Handle direct response format
      if ("image" in response.data && typeof response.data === "object") {
        return (response.data as UploadImageResponse).image.url;
      }
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to upload image";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error("Failed to upload image");
    throw error;
  }
};
