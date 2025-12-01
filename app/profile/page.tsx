"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useUserStore } from "@/zustand/stores/user-store";
import { useFilesStore } from "@/zustand/stores/files-store";
import { User } from "@/types/user-types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please provide a valid Indian phone number")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  profilePicture: z.string().optional(),
  address: z
    .object({
      street: z
        .string()
        .max(200, "Street address must be less than 200 characters")
        .optional()
        .or(z.literal("")),
      city: z
        .string()
        .max(100, "City must be less than 100 characters")
        .optional()
        .or(z.literal("")),
      state: z
        .string()
        .max(100, "State must be less than 100 characters")
        .optional()
        .or(z.literal("")),
      pincode: z
        .string()
        .regex(/^\d{6}$/, "Pincode must be 6 digits")
        .optional()
        .or(z.literal("")),
      country: z
        .string()
        .max(100, "Country must be less than 100 characters")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar number must be 12 digits")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Please provide a valid PAN number")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { currentUser: authUser } = useAuthStore();
  const {
    currentUser,
    isUpdateLoading,
    error: userError,
    updateUser,
    setCurrentUser,
    clearError,
  } = useUserStore();
  const { uploadImage, isUploading, uploadedFileUrl, clearUploadState } =
    useFilesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Compute the display image - use uploaded preview if available, otherwise use current user's picture
  const displayImage = useMemo(() => {
    if (profileImagePreview) return profileImagePreview;
    return currentUser?.profilePicture || null;
  }, [profileImagePreview, currentUser?.profilePicture]);

  // Initialize user store with auth user
  useEffect(() => {
    if (authUser && !currentUser) {
      setCurrentUser(authUser);
    }
  }, [authUser, currentUser, setCurrentUser]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      clearUploadState();
    };
  }, [clearError, clearUploadState]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentUser
      ? {
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          dateOfBirth: currentUser.dateOfBirth
            ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
            : "",
          profilePicture: currentUser.profilePicture || "",
          address: {
            street: currentUser.address?.street || "",
            city: currentUser.address?.city || "",
            state: currentUser.address?.state || "",
            pincode: currentUser.address?.pincode || "",
            country: currentUser.address?.country || "",
          },
          aadhaarNumber: currentUser.aadhaarNumber || "",
          panNumber: currentUser.panNumber || "",
        }
      : undefined,
  });

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        dateOfBirth: currentUser.dateOfBirth
          ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
          : "",
        profilePicture: currentUser.profilePicture || "",
        address: {
          street: currentUser.address?.street || "",
          city: currentUser.address?.city || "",
          state: currentUser.address?.state || "",
          pincode: currentUser.address?.pincode || "",
          country: currentUser.address?.country || "",
        },
        aadhaarNumber: currentUser.aadhaarNumber || "",
        panNumber: currentUser.panNumber || "",
      });
    }
  }, [currentUser, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image immediately
    try {
      const imageUrl = await uploadImage(file, "rentfit/profile-pictures", [
        "profile",
        "user",
      ]);
      if (imageUrl) {
        setValue("profilePicture", imageUrl);
        toast.success("Profile picture uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload profile picture");
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser?._id) {
      toast.error("User not found");
      return;
    }

    try {
      // If a file was selected but not uploaded yet, upload it first
      let profilePictureUrl = data.profilePicture;
      if (selectedFile && !uploadedFileUrl) {
        const imageUrl = await uploadImage(
          selectedFile,
          "rentfit/profile-pictures",
          ["profile", "user"]
        );
        if (imageUrl) {
          profilePictureUrl = imageUrl;
        }
      } else if (uploadedFileUrl) {
        profilePictureUrl = uploadedFileUrl;
      }

      // Prepare update data - convert string dateOfBirth to Date and remove empty strings
      const updateData: Partial<User> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.phone && { phone: data.phone }),
        ...(data.dateOfBirth && {
          dateOfBirth: new Date(data.dateOfBirth),
        }),
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
        ...(data.aadhaarNumber && { aadhaarNumber: data.aadhaarNumber }),
        ...(data.panNumber && { panNumber: data.panNumber }),
      };

      // Only include address if at least one field is filled
      if (data.address) {
        const addressFields = Object.entries(data.address).filter(
          ([, value]) => value && value.trim() !== ""
        );
        if (addressFields.length > 0) {
          updateData.address = Object.fromEntries(
            addressFields
          ) as User["address"];
        }
      }

      await updateUser(currentUser._id, updateData);

      // Update auth store with new user data
      const updatedUser = useUserStore.getState().currentUser;
      if (updatedUser) {
        useAuthStore.setState({ currentUser: updatedUser });
      }

      // Clear upload state and reset file input
      clearUploadState();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  if (!currentUser) {
    return (
      <AppLayout
        breadcrumbs={[
          { title: "Profile", href: "/profile", isCurrentPage: true },
        ]}
        title="Profile Settings"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading user data...</p>
        </div>
      </AppLayout>
    );
  }

  const breadcrumbs = [
    { title: "Profile", href: "/profile", isCurrentPage: true },
  ];

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Profile Settings"
      subtitle="Update your personal information and preferences"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit)(e);
        }}
      >
        <FieldGroup className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <FieldError
                    errors={[{ message: errors.firstName.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <FieldError errors={[{ message: errors.lastName.message }]} />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <FieldError errors={[{ message: errors.email.message }]} />
              )}
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              {errors.phone && (
                <FieldError errors={[{ message: errors.phone.message }]} />
              )}
              <FieldDescription>
                Enter a valid 10-digit Indian phone number
              </FieldDescription>
            </Field>

            <Field data-invalid={!!errors.dateOfBirth}>
              <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => {
                  const dateValue = field.value
                    ? new Date(field.value as string)
                    : undefined;

                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !dateValue && "text-muted-foreground"
                          )}
                          aria-invalid={!!errors.dateOfBirth}
                          id="dateOfBirth"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateValue ? (
                            dateValue.toLocaleDateString()
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateValue}
                          onSelect={(date) =>
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : ""
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {errors.dateOfBirth && (
                <FieldError
                  errors={[{ message: errors.dateOfBirth.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.profilePicture}>
              <FieldLabel htmlFor="profilePicture">Profile Picture</FieldLabel>
              <div className="space-y-4">
                {displayImage && (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={displayImage}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-invalid={!!errors.profilePicture}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading
                      ? "Uploading..."
                      : displayImage
                        ? "Change Picture"
                        : "Upload Picture"}
                  </Button>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                {errors.profilePicture && (
                  <FieldError
                    errors={[{ message: errors.profilePicture.message }]}
                  />
                )}
                <FieldDescription>
                  Upload a profile picture (Max 5MB). Supported formats: JPEG,
                  PNG, WebP, GIF
                </FieldDescription>
              </div>
            </Field>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Address</h2>

            <Field data-invalid={!!errors.address?.street}>
              <FieldLabel htmlFor="address.street">Street Address</FieldLabel>
              <Input
                id="address.street"
                type="text"
                placeholder="123 Main Street"
                aria-invalid={!!errors.address?.street}
                {...register("address.street")}
              />
              {errors.address?.street && (
                <FieldError
                  errors={[{ message: errors.address.street.message }]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.address?.city}>
                <FieldLabel htmlFor="address.city">City</FieldLabel>
                <Input
                  id="address.city"
                  type="text"
                  placeholder="Mumbai"
                  aria-invalid={!!errors.address?.city}
                  {...register("address.city")}
                />
                {errors.address?.city && (
                  <FieldError
                    errors={[{ message: errors.address.city.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.address?.state}>
                <FieldLabel htmlFor="address.state">State</FieldLabel>
                <Input
                  id="address.state"
                  type="text"
                  placeholder="Maharashtra"
                  aria-invalid={!!errors.address?.state}
                  {...register("address.state")}
                />
                {errors.address?.state && (
                  <FieldError
                    errors={[{ message: errors.address.state.message }]}
                  />
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.address?.pincode}>
                <FieldLabel htmlFor="address.pincode">Pincode</FieldLabel>
                <Input
                  id="address.pincode"
                  type="text"
                  placeholder="400001"
                  maxLength={6}
                  aria-invalid={!!errors.address?.pincode}
                  {...register("address.pincode")}
                />
                {errors.address?.pincode && (
                  <FieldError
                    errors={[{ message: errors.address.pincode.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.address?.country}>
                <FieldLabel htmlFor="address.country">Country</FieldLabel>
                <Input
                  id="address.country"
                  type="text"
                  placeholder="India"
                  aria-invalid={!!errors.address?.country}
                  {...register("address.country")}
                />
                {errors.address?.country && (
                  <FieldError
                    errors={[{ message: errors.address.country.message }]}
                  />
                )}
              </Field>
            </div>
          </div>

          {/* Identity Documents Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Identity Documents</h2>

            <Field data-invalid={!!errors.aadhaarNumber}>
              <FieldLabel htmlFor="aadhaarNumber">Aadhaar Number</FieldLabel>
              <Input
                id="aadhaarNumber"
                type="text"
                placeholder="123456789012"
                maxLength={12}
                aria-invalid={!!errors.aadhaarNumber}
                {...register("aadhaarNumber")}
              />
              {errors.aadhaarNumber && (
                <FieldError
                  errors={[{ message: errors.aadhaarNumber.message }]}
                />
              )}
              <FieldDescription>
                Enter your 12-digit Aadhaar number (optional)
              </FieldDescription>
            </Field>

            <Field data-invalid={!!errors.panNumber}>
              <FieldLabel htmlFor="panNumber">PAN Number</FieldLabel>
              <Input
                id="panNumber"
                type="text"
                placeholder="ABCDE1234F"
                maxLength={10}
                aria-invalid={!!errors.panNumber}
                {...register("panNumber")}
                style={{ textTransform: "uppercase" }}
              />
              {errors.panNumber && (
                <FieldError errors={[{ message: errors.panNumber.message }]} />
              )}
              <FieldDescription>
                Enter your 10-character PAN number (optional)
              </FieldDescription>
            </Field>
          </div>

          {/* Error Display */}
          {userError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{userError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Field>
            <Button
              type="submit"
              disabled={isSubmitting || isUpdateLoading}
              className="w-full md:max-w-fit"
            >
              {isSubmitting || isUpdateLoading
                ? "Updating Profile..."
                : "Update Profile"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AppLayout>
  );
}
