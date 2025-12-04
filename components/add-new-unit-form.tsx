"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useStaticStore } from "@/zustand/stores/static-store";
import { Unit } from "@/types/property-types";
import { usePropertyStore } from "@/zustand/stores/property-store";
import { toast } from "sonner";

const unitSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required").trim(),
    line2: z.string().optional(),
    countryId: z.string().min(1, "Country is required"),
    stateId: z.string().min(1, "State is required"),
    cityId: z.string().min(1, "City is required"),
    pincode: z.string().min(1, "Pincode is required").trim(),
  }),
  geo: z.object({
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  }),
  beds: z
    .number()
    .int("Number of beds must be an integer")
    .min(0, "Number of beds must be 0 or greater"),
  areaSqFt: z.number().min(0, "Area must be 0 or greater"),
  status: z.enum(["vacant", "occupied", "maintenance"]),
});

type UnitFormData = z.infer<typeof unitSchema>;

export function AddNewUnitForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    countries,
    states,
    cities,
    isCountriesLoading,
    isStatesLoading,
    isCitiesLoading,
    getCountries,
    getStates,
    getCities,
  } = useStaticStore();

  const { addUnit } = usePropertyStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      status: "vacant",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedCountryId = watch("address.countryId");
  const selectedStateId = watch("address.stateId");

  // Load countries on mount
  useEffect(() => {
    getCountries(1, 100, null);
  }, [getCountries]);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      setValue("address.stateId", "", { shouldValidate: true });
      setValue("address.cityId", "", { shouldValidate: true });
      getStates(1, 100, selectedCountryId);
    }
  }, [selectedCountryId, getStates, setValue]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      setValue("address.cityId", "", { shouldValidate: true });
      getCities(1, 100, selectedStateId);
    }
  }, [selectedStateId, getCities, setValue]);

  const onSubmit = async (data: UnitFormData) => {
    // Transform form data to match backend schema
    const unitData: Unit = {
      ownerId: currentUser?._id || "",
      title: data.title,
      address: {
        line1: data.address.line1,
        line2: data.address.line2 || undefined,
        countryId: data.address.countryId,
        stateId: data.address.stateId,
        cityId: data.address.cityId,
        pincode: data.address.pincode,
      },
      geo: {
        type: "Point" as const,
        coordinates: [data.geo.longitude, data.geo.latitude], // [longitude, latitude] for GeoJSON
      },
      beds: data.beds,
      areaSqFt: data.areaSqFt,
      status: data.status,
    };

    console.log("Unit data to submit:", unitData);

    const result = await addUnit(unitData);

    // If result is null, the error was already handled by makeRequest (error toast shown)
    // If result is not null, the unit was added successfully
    if (result) {
      toast.success("Unit added successfully!");
      reset({
        status: "vacant",
      });
      // Redirect to units page after successful addition
      router.push("/properties/units");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <FieldGroup>
          {/* Title */}
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              type="text"
              placeholder="Enter unit title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <FieldError errors={[{ message: errors.title.message }]} />
            )}
          </Field>

          {/* Address Section */}
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Address</h2>
              <FieldDescription>
                Enter the complete address of the property unit.
              </FieldDescription>
            </div>

            <Field data-invalid={!!errors.address?.line1}>
              <FieldLabel htmlFor="address-line1">Address Line 1</FieldLabel>
              <Input
                id="address-line1"
                type="text"
                placeholder="Enter address line 1"
                aria-invalid={!!errors.address?.line1}
                {...register("address.line1")}
              />
              {errors.address?.line1 && (
                <FieldError
                  errors={[{ message: errors.address.line1.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.address?.line2}>
              <FieldLabel htmlFor="address-line2">
                Address Line 2 (Optional)
              </FieldLabel>
              <Input
                id="address-line2"
                type="text"
                placeholder="Enter address line 2"
                aria-invalid={!!errors.address?.line2}
                {...register("address.line2")}
              />
              {errors.address?.line2 && (
                <FieldError
                  errors={[{ message: errors.address.line2.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.address?.countryId}>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Controller
                name="address.countryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                      trigger("address.countryId");
                    }}
                    disabled={isCountriesLoading}
                  >
                    <SelectTrigger
                      id="country"
                      className={cn(
                        errors.address?.countryId && "border-destructive"
                      )}
                      aria-invalid={!!errors.address?.countryId}
                    >
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country._id} value={country._id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.address?.countryId && (
                <FieldError
                  errors={[{ message: errors.address.countryId.message }]}
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.address?.stateId}>
                <FieldLabel htmlFor="state">State</FieldLabel>
                <Controller
                  name="address.stateId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        trigger("address.stateId");
                      }}
                      disabled={isStatesLoading || !selectedCountryId}
                    >
                      <SelectTrigger
                        id="state"
                        className={cn(
                          errors.address?.stateId && "border-destructive"
                        )}
                        aria-invalid={!!errors.address?.stateId}
                      >
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((state) => (
                          <SelectItem key={state._id} value={state._id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.address?.stateId && (
                  <FieldError
                    errors={[{ message: errors.address.stateId.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.address?.cityId}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Controller
                  name="address.cityId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        trigger("address.cityId");
                      }}
                      disabled={isCitiesLoading || !selectedStateId}
                    >
                      <SelectTrigger
                        id="city"
                        className={cn(
                          errors.address?.cityId && "border-destructive"
                        )}
                        aria-invalid={!!errors.address?.cityId}
                      >
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city._id} value={city._id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.address?.cityId && (
                  <FieldError
                    errors={[{ message: errors.address.cityId.message }]}
                  />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.address?.pincode}>
              <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
              <Input
                id="pincode"
                type="text"
                placeholder="Enter pincode"
                aria-invalid={!!errors.address?.pincode}
                {...register("address.pincode")}
              />
              {errors.address?.pincode && (
                <FieldError
                  errors={[{ message: errors.address.pincode.message }]}
                />
              )}
            </Field>
          </div>

          {/* Geo Location Section */}
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Location Coordinates</h2>
              <FieldDescription>
                Provide the geographic coordinates (latitude and longitude) for
                the property location.
              </FieldDescription>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.geo?.latitude}>
                <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="Enter latitude"
                  aria-invalid={!!errors.geo?.latitude}
                  {...register("geo.latitude", {
                    valueAsNumber: true,
                  })}
                />
                {errors.geo?.latitude && (
                  <FieldError
                    errors={[{ message: errors.geo.latitude.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.geo?.longitude}>
                <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="Enter longitude"
                  aria-invalid={!!errors.geo?.longitude}
                  {...register("geo.longitude", {
                    valueAsNumber: true,
                  })}
                />
                {errors.geo?.longitude && (
                  <FieldError
                    errors={[{ message: errors.geo.longitude.message }]}
                  />
                )}
              </Field>
            </div>
          </div>

          {/* Unit Details Section */}
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Unit Details</h2>
              <FieldDescription>
                Specify the number of beds, area, and current status of the
                unit.
              </FieldDescription>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.beds}>
                <FieldLabel htmlFor="beds">Number of Beds</FieldLabel>
                <Input
                  id="beds"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Enter number of beds"
                  aria-invalid={!!errors.beds}
                  {...register("beds", {
                    valueAsNumber: true,
                  })}
                />
                {errors.beds && (
                  <FieldError errors={[{ message: errors.beds.message }]} />
                )}
              </Field>

              <Field data-invalid={!!errors.areaSqFt}>
                <FieldLabel htmlFor="areaSqFt">Area (sq ft)</FieldLabel>
                <Input
                  id="areaSqFt"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Enter area in square feet"
                  aria-invalid={!!errors.areaSqFt}
                  {...register("areaSqFt", {
                    valueAsNumber: true,
                  })}
                />
                {errors.areaSqFt && (
                  <FieldError errors={[{ message: errors.areaSqFt.message }]} />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="status"
                      className={cn(errors.status && "border-destructive")}
                      aria-invalid={!!errors.status}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <FieldError errors={[{ message: errors.status.message }]} />
              )}
            </Field>
          </div>

          <Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="max-w-fit mt-8"
            >
              {isSubmitting ? "Submitting..." : "Add Unit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
