"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTenancyWizardStore } from "@/zustand/stores/tenancy-wizard-store";
import { useAgreementStore } from "@/zustand/stores/agreement-store";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight, ArrowLeft, X } from "lucide-react";
import { ApiError } from "@/lib/api-utils";

const clausesSchema = z.object({
  clauses: z
    .array(
      z.object({
        key: z.string().optional(),
        text: z.string().min(1, "Clause text is required"),
      })
    )
    .min(1, "At least one clause is required"),
  templateName: z.string().optional(),
  stateCode: z.string().optional(),
});

type ClausesFormDataType = z.infer<typeof clausesSchema>;

// Default example clauses
const defaultClauses = [
  {
    key: "rent_payment",
    text: "The tenant agrees to pay the monthly rent of ₹[AMOUNT] on or before the [DAY] of each month. Late payments will incur a penalty of ₹[PENALTY] per day after the due date.",
  },
  {
    key: "maintenance",
    text: "The tenant is responsible for maintaining the property in good condition and reporting any damages or necessary repairs to the landlord promptly. Normal wear and tear is expected.",
  },
];

interface ClausesFormProps extends React.ComponentProps<"div"> {
  onDiscardAndReset?: () => void;
}

export function ClausesForm({
  className,
  onDiscardAndReset,
  ...props
}: ClausesFormProps) {
  const { currentUser } = useAuthStore();
  const {
    selectedUnit,
    selectedTenant,
    formData,
    setFormData,
    setStep,
    setAgreementId,
    agreementId,
    resetWizard,
  } = useTenancyWizardStore();
  const { createAgreement, isCreating } = useAgreementStore();

  // Get initial clauses from formData or use defaults
  const initialClauses = useMemo(() => {
    return formData?.clauses && formData.clauses.length > 0
      ? formData.clauses
      : defaultClauses;
  }, [formData?.clauses]);

  const form = useForm<ClausesFormDataType>({
    resolver: zodResolver(clausesSchema),
    defaultValues: {
      clauses: initialClauses,
      templateName: formData?.templateName || "standard",
      stateCode: formData?.stateCode,
    },
  });

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState<ClausesFormDataType>({
    clauses: initialClauses,
    templateName: formData?.templateName || "standard",
    stateCode: formData?.stateCode,
  });

  // Reset form when formData changes (when navigating back)
  useEffect(() => {
    if (formData) {
      const clausesToUse =
        formData.clauses && formData.clauses.length > 0
          ? formData.clauses
          : defaultClauses;
      const newValues = {
        clauses: clausesToUse,
        templateName: formData.templateName || "standard",
        stateCode: formData.stateCode,
      };
      form.reset(newValues);
      setOriginalValues(newValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Watch form values to detect changes
  const currentValues = form.watch();

  // Check if clauses have been modified
  const hasChanges = useMemo(() => {
    if (!agreementId) {
      // No agreement exists, so we need to create one
      return true;
    }

    // Compare current values with original
    const currentClauses = currentValues.clauses || [];
    const originalClauses = originalValues.clauses || [];

    // Check if number of clauses changed
    if (currentClauses.length !== originalClauses.length) {
      return true;
    }

    // Check if any clause text or key changed
    for (let i = 0; i < currentClauses.length; i++) {
      const current = currentClauses[i];
      const original = originalClauses[i];

      if (
        current.text.trim() !== original.text.trim() ||
        (current.key || "") !== (original.key || "")
      ) {
        return true;
      }
    }

    // Check if templateName or stateCode changed
    if (currentValues.templateName !== originalValues.templateName) {
      return true;
    }
    if (currentValues.stateCode !== originalValues.stateCode) {
      return true;
    }

    return false;
  }, [currentValues, originalValues, agreementId]);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "clauses",
  });

  const onSubmit = async (data: ClausesFormDataType) => {
    if (!selectedUnit || !selectedTenant || !currentUser) {
      toast.error("Please select unit and tenant first");
      return;
    }

    // Combine form data
    const completeFormData = {
      ...formData!,
      clauses: data.clauses.filter((c) => c.text.trim().length > 0),
      templateName: data.templateName,
      stateCode: data.stateCode,
    };

    setFormData(completeFormData);

    // If agreement already exists and no changes were made, just continue
    if (agreementId && !hasChanges) {
      setStep(4);
      return;
    }

    // Otherwise, create or update agreement
    try {
      const agreement = await createAgreement({
        templateName: completeFormData.templateName,
        stateCode: completeFormData.stateCode,
        clauses: completeFormData.clauses,
        createdBy: currentUser._id,
        status: "pending_signature",
        signers: [],
        tenancyData: {
          ownerId: currentUser._id,
          tenantId: selectedTenant._id,
          unitId: selectedUnit._id || "",
          rent: completeFormData.rent,
          deposit: completeFormData.deposit,
        },
      });

      if (agreement) {
        toast.success("Agreement created successfully!");
        setAgreementId(agreement._id);
        // Update original values after creating agreement
        setOriginalValues({
          clauses: completeFormData.clauses,
          templateName: completeFormData.templateName,
          stateCode: completeFormData.stateCode,
        });
        setStep(4);
      } else {
        toast.error("Failed to create agreement");
      }
    } catch (error) {
      console.error("Error creating agreement:", error);
      // Reset wizard state on 404 error
      if (error instanceof ApiError && error.statusCode === 404) {
        resetWizard();
        setStep(1);
        toast.error("Agreement not found. Wizard has been reset.");
      } else {
        toast.error("Failed to create agreement");
      }
    }
  };

  const handleContinue = () => {
    // Update formData with current values even if no changes
    const completeFormData = {
      ...formData!,
      clauses: currentValues.clauses.filter((c) => c.text.trim().length > 0),
      templateName: currentValues.templateName,
      stateCode: currentValues.stateCode,
    };
    setFormData(completeFormData);
    setStep(4);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Clauses Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Agreement Clauses</h2>
              <p className="text-sm text-muted-foreground">
                Review and customize the agreement clauses. You can edit, add,
                or remove clauses as needed. Two sample clauses are provided by
                default.
              </p>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative rounded-xl border-2 border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6 space-y-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:bg-card"
                >
                  {/* Header with number badge and delete button */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold shadow-sm border border-primary/20">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <FormField
                          control={form.control}
                          name={`clauses.${index}.key`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Clause Key (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., rent_payment, termination"
                                  className="h-9 bg-background/50 border-muted focus:border-primary/50"
                                  {...formField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => remove(index)}
                        title="Remove clause"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Clause Text */}
                  <FormField
                    control={form.control}
                    name={`clauses.${index}.text`}
                    render={({ field: formField }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-foreground">
                          Clause Text
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Enter clause text..."
                            className="resize-none bg-background/50 border-muted focus:border-primary/50 text-sm leading-relaxed min-h-[120px]"
                            {...formField}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formField.value?.length || 0} characters
                          </p>
                          {formField.value && formField.value.length > 0 && (
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ key: "", text: "" })}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Clause
            </Button>

            {errors.clauses && typeof errors.clauses.message === "string" && (
              <p className="text-sm font-medium text-destructive">
                {errors.clauses.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="destructive"
              onClick={onDiscardAndReset}
              className="gap-2 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              Discard and Reset
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {/* Show Continue button if agreement exists and no changes, otherwise show Create Agreement */}
              {agreementId && !hasChanges ? (
                <Button
                  type="button"
                  onClick={handleContinue}
                  className="w-full sm:w-auto max-w-fit"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || isCreating}
                  className="w-full sm:w-auto max-w-fit"
                >
                  {isSubmitting || isCreating ? (
                    "Creating Agreement..."
                  ) : (
                    <>
                      Create Agreement
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
