"use client";

import AppLayout from "@/layouts/app-layout";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useTenancyStore } from "@/zustand/stores/tenancy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  User,
  FileText,
  Download,
  CheckCircle2,
  CreditCard,
  Building2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Tenancy } from "@/types/tenancy-types";
import Link from "next/link";

// Extended Tenancy type to include populated fields
interface PopulatedTenancy extends Omit<
  Tenancy,
  "unitId" | "ownerId" | "tenantId"
> {
  unitId?:
    | string
    | {
        _id?: string;
        title?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          pincode?: string;
        };
      };
  ownerId?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  tenantId?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
}

const getTenancyStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500 text-white";
    case "terminated":
      return "bg-red-500 text-white";
    case "pendingRenewal":
      return "bg-yellow-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getDepositStatusBadge = (status?: string) => {
  switch (status) {
    case "held":
      return "bg-blue-500 text-white";
    case "returned":
      return "bg-green-500 text-white";
    case "disputed":
      return "bg-red-500 text-white";
    case "upcoming":
      return "bg-yellow-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export default function RentStatusPage() {
  const { currentUser } = useAuthStore();
  const { tenancies, getTenancies, isTenanciesLoading } = useTenancyStore();
  const [selectedTenancyId, setSelectedTenancyId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (currentUser) {
      // Filter by tenantId for tenants
      getTenancies({ tenantId: currentUser._id, status: "active" });
    }
  }, [currentUser, getTenancies]);

  // Get active tenancies
  const activeTenancies = useMemo(() => {
    return (tenancies as PopulatedTenancy[]).filter(
      (t) => t.status === "active"
    );
  }, [tenancies]);

  // Select first tenancy by default
  useEffect(() => {
    if (activeTenancies.length > 0 && !selectedTenancyId) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setSelectedTenancyId(activeTenancies[0]._id);
      });
    }
  }, [activeTenancies, selectedTenancyId]);

  const selectedTenancy = useMemo(() => {
    return activeTenancies.find((t) => t._id === selectedTenancyId);
  }, [activeTenancies, selectedTenancyId]);

  const breadcrumbs = [
    {
      title: "My Rent",
      href: "/my-rent",
    },
    {
      title: "Rent Status",
      href: "/my-rent/status",
      isCurrentPage: true,
    },
  ];

  if (isTenanciesLoading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs} title="Rent Status" subtitle="">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (activeTenancies.length === 0) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        title="Rent Status"
        subtitle="View your rent payment status and history"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold mb-2">No Active Tenancies</p>
            <p className="text-muted-foreground text-center max-w-md">
              You don&apos;t have any active tenancies at the moment. Once you
              have an active tenancy, you&apos;ll be able to view your rent
              status here.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Rent Status"
      subtitle="View your rent payment status and history"
    >
      <div className="space-y-6">
        {/* Tenancy Selector */}
        {activeTenancies.length > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tenancy</label>
                <Select
                  value={selectedTenancyId || ""}
                  onValueChange={setSelectedTenancyId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tenancy" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTenancies.map((tenancy) => {
                      const unit = tenancy.unitId;
                      const unitTitle =
                        typeof unit === "object" && unit?.title
                          ? unit.title
                          : "Unit";
                      return (
                        <SelectItem key={tenancy._id} value={tenancy._id}>
                          {unitTitle}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTenancy && (
          <>
            {/* Main Grid Layout - Professional Corporate Design */}
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column - Main Content (8 columns) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Combined Card: Rent Overview & Tenancy Information */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-2xl font-semibold tracking-tight">
                        Rent Overview & Tenancy Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current tenancy payment and property details
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Rent Overview Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Rent Overview
                        </h3>
                      </div>
                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Monthly Rent Amount
                          </p>
                          <p className="text-4xl font-semibold tracking-tight mt-3">
                            ₹
                            {selectedTenancy.rent?.amount?.toLocaleString() ||
                              0}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2 capitalize">
                            {selectedTenancy.rent?.cycle || "monthly"} payment
                            cycle
                          </p>
                        </div>
                        <div className="space-y-6">
                          {selectedTenancy.rent?.dueDateDay && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Payment Due Date
                              </p>
                              <p className="text-xl font-semibold mt-1">
                                {selectedTenancy.rent.dueDateDay}
                                <span className="text-base font-normal text-muted-foreground ml-1">
                                  {getOrdinalSuffix(
                                    selectedTenancy.rent.dueDateDay
                                  )}{" "}
                                  of each month
                                </span>
                              </p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Utilities
                            </p>
                            <p className="text-sm font-medium mt-1">
                              {selectedTenancy.rent?.utilitiesIncluded
                                ? "Included in rent"
                                : "Not included"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Tenancy Information Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Tenancy Information
                        </h3>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Property Unit
                            </p>
                            <p className="text-base font-semibold">
                              {typeof selectedTenancy.unitId === "object" &&
                              selectedTenancy.unitId?.title
                                ? selectedTenancy.unitId.title
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Landlord
                            </p>
                            <p className="text-base font-semibold">
                              {typeof selectedTenancy.ownerId === "object" &&
                              selectedTenancy.ownerId
                                ? `${selectedTenancy.ownerId.firstName || ""} ${selectedTenancy.ownerId.lastName || ""}`.trim() ||
                                  selectedTenancy.ownerId.email ||
                                  "—"
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section: Recent Payments */}
                {selectedTenancy.payments &&
                  selectedTenancy.payments.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                          Recent Payments
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Latest payment transactions
                        </p>
                      </div>
                      <Card className="border shadow-sm">
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {selectedTenancy.payments
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime()
                              )
                              .slice(0, 4)
                              .map((payment, index) => (
                                <div
                                  key={index}
                                  className="p-6 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                          <p className="text-lg font-semibold">
                                            ₹{payment.amount.toLocaleString()}
                                          </p>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Paid
                                          </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                          <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(
                                              parseISO(payment.date),
                                              "MMM dd, yyyy"
                                            )}
                                          </span>
                                          {payment.method && (
                                            <span className="flex items-center gap-1.5">
                                              <CreditCard className="h-3.5 w-3.5" />
                                              {payment.method}
                                            </span>
                                          )}
                                          {payment.reference && (
                                            <span className="text-xs">
                                              Ref: {payment.reference}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {payment.receiptUrl && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                          className="shrink-0"
                                        >
                                          <a
                                            href={payment.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                          >
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                              Receipt
                                            </span>
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {selectedTenancy.payments.length > 4 && (
                            <div className="p-6 border-t">
                              <Button
                                variant="outline"
                                className="w-full"
                                asChild
                              >
                                <a href="/my-rent/history">
                                  View All Payment History
                                </a>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
              </div>

              {/* Right Sidebar - Summary Information (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Status Summary */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      Tenancy Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      className={cn(
                        "w-full justify-center py-2 text-sm font-medium",
                        getTenancyStatusBadge(selectedTenancy.status)
                      )}
                    >
                      {selectedTenancy.status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Security Deposit */}
                {selectedTenancy.deposit && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">
                        Security Deposit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold mb-2">
                          ₹
                          {selectedTenancy.deposit.amount?.toLocaleString() ||
                            0}
                        </p>
                        {selectedTenancy.deposit.status && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getDepositStatusBadge(
                                selectedTenancy.deposit.status
                              )
                            )}
                          >
                            {selectedTenancy.deposit.status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Agreement Details */}
                {selectedTenancy.agreement && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">
                        Agreement Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTenancy.agreement.version && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            Version
                          </p>
                          <p className="text-base font-semibold">
                            v{selectedTenancy.agreement.version}
                          </p>
                        </div>
                      )}
                      {selectedTenancy.agreement.signedAt && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            Signed Date
                          </p>
                          <p className="text-base font-semibold">
                            {format(
                              parseISO(selectedTenancy.agreement.signedAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        </div>
                      )}
                      <div className="space-y-3 pt-2">
                        {selectedTenancy.agreement.agreementId && (
                          <Link
                            href={`/my-agreement/${selectedTenancy.agreement.agreementId}`}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  View Agreement Details
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  View full agreement information
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </Link>
                        )}
                        {selectedTenancy.agreement.pdfUrl && (
                          <Button variant="outline" className="w-full" asChild>
                            <a
                              href={selectedTenancy.agreement.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download Agreement PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
