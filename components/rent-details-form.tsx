"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useTenancyWizardStore } from "@/zustand/stores/tenancy-wizard-store";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

const rentDetailsSchema = z.object({
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
});

type RentDetailsFormDataType = z.infer<typeof rentDetailsSchema>;

interface RentDetailsFormProps extends React.ComponentProps<"div"> {
  onDiscardAndReset?: () => void;
}

export function RentDetailsForm({
  className,
  onDiscardAndReset,
  ...props
}: RentDetailsFormProps) {
  const { formData, setFormData, setStep } = useTenancyWizardStore();

  const form = useForm<RentDetailsFormDataType>({
    resolver: zodResolver(rentDetailsSchema),
    defaultValues: {
      rent: formData?.rent || {
        amount: 0,
        cycle: "monthly",
        dueDateDay: 1,
        utilitiesIncluded: false,
      },
      deposit: formData?.deposit || {
        amount: 0,
        status: "upcoming",
      },
    },
  });

  // Reset form when formData changes (when navigating back)
  useEffect(() => {
    if (formData) {
      form.reset({
        rent: formData.rent || {
          amount: 0,
          cycle: "monthly",
          dueDateDay: 1,
          utilitiesIncluded: false,
        },
        deposit: formData.deposit || {
          amount: 0,
          status: "upcoming",
        },
      });
    }
  }, [formData, form]);

  const { handleSubmit } = form;

  const onSubmit = (data: RentDetailsFormDataType) => {
    setFormData(data);
    setStep(3);
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
                onClick={() => setStep(1)}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" className="w-full sm:w-auto max-w-fit">
                Continue to Clauses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
