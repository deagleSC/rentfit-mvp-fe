"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAgreementStore } from "@/zustand/stores/agreement-store";
import { useTenancyWizardStore } from "@/zustand/stores/tenancy-wizard-store";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

const agreementSchema = z.object({
  rent: z.object({
    amount: z
      .number()
      .min(0, "Rent amount must be 0 or greater")
      .positive("Rent amount must be greater than 0"),
    cycle: z.enum(["monthly", "quarterly", "yearly"]),
    dueDateDay: z
      .number()
      .int("Due date day must be an integer")
      .min(1, "Due date day must be between 1 and 28")
      .max(28, "Due date day must be between 1 and 28")
      .optional(),
    utilitiesIncluded: z.boolean().optional(),
  }),
  deposit: z
    .object({
      amount: z
        .number()
        .min(0, "Deposit amount must be 0 or greater")
        .optional(),
      status: z.enum(["upcoming", "held", "returned", "disputed"]).optional(),
    })
    .optional(),
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

type AgreementFormDataType = z.infer<typeof agreementSchema>;

export function AgreementDetailsForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentUser } = useAuthStore();
  const { selectedUnit, selectedTenant, setStep } = useTenancyWizardStore();
  const { createAgreement, isCreating } = useAgreementStore();

  const form = useForm<AgreementFormDataType>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      rent: {
        amount: 0,
        cycle: "monthly",
        dueDateDay: 1,
        utilitiesIncluded: false,
      },
      deposit: {
        amount: 0,
        status: "upcoming",
      },
      clauses: [
        {
          key: "rent_payment",
          text: "The tenant agrees to pay the monthly rent of ₹[AMOUNT] on or before the [DAY] of each month. Late payments will incur a penalty of ₹[PENALTY] per day after the due date.",
        },
        {
          key: "maintenance",
          text: "The tenant is responsible for maintaining the property in good condition and reporting any damages or necessary repairs to the landlord promptly. Normal wear and tear is expected.",
        },
        {
          key: "termination",
          text: "Either party may terminate this agreement by providing [NUMBER] days written notice. The tenant must vacate the premises and return all keys by the termination date.",
        },
      ],
      templateName: "standard",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "clauses",
  });

  const onSubmit = async (data: AgreementFormDataType) => {
    if (!selectedUnit || !selectedTenant || !currentUser) {
      toast.error("Please select unit and tenant first");
      return;
    }

    try {
      const agreement = await createAgreement({
        templateName: data.templateName,
        stateCode: data.stateCode,
        clauses: data.clauses.filter((c) => c.text.trim().length > 0),
        createdBy: currentUser._id,
        status: "pending_signature",
        signers: [],
        tenancyData: {
          ownerId: currentUser._id,
          tenantId: selectedTenant._id,
          unitId: selectedUnit._id || "",
          rent: {
            amount: data.rent.amount,
            cycle: data.rent.cycle,
            dueDateDay: data.rent.dueDateDay,
            utilitiesIncluded: data.rent.utilitiesIncluded,
          },
          deposit: data.deposit
            ? {
                amount: data.deposit.amount,
                status: data.deposit.status || "upcoming",
              }
            : undefined,
        },
      });

      if (agreement) {
        toast.success("Agreement created successfully!");
        // Agreement is created, now user needs to sign it
        // The parent component will handle showing the signing interface
      } else {
        toast.error("Failed to create agreement");
      }
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Rent Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Rent Details</h2>
              <p className="text-sm text-muted-foreground">
                Enter the rent amount and payment cycle details.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rent.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rent.cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rent.dueDateDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date Day (1-28)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="28"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rent.utilitiesIncluded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Utilities Included
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Deposit Details Section */}
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Deposit Details</h2>
              <p className="text-sm text-muted-foreground">
                Enter the security deposit amount and status (optional).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="deposit.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="held">Held</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="disputed">Disputed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Clauses Section */}
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Agreement Clauses</h2>
              <p className="text-sm text-muted-foreground">
                Review and customize the agreement clauses. You can edit, add,
                or remove clauses as needed. Sample clauses are provided by
                default.
              </p>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative rounded-lg border bg-card p-4 sm:p-6 space-y-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {index + 1}
                        </div>
                        <FormField
                          control={form.control}
                          name={`clauses.${index}.key`}
                          render={({ field: formField }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs text-muted-foreground">
                                Clause Key (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., rent_payment, termination"
                                  className="h-9"
                                  {...formField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`clauses.${index}.text`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Clause Text
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder="Enter clause text..."
                                className="resize-none"
                                {...formField}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground">
                              {formField.value?.length || 0} characters
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        title="Remove clause"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCreating}
              className="w-full sm:w-auto sm:ml-auto max-w-fit"
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
          </div>
        </form>
      </Form>
    </div>
  );
}
