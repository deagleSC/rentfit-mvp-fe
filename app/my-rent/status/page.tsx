"use client";

import AppLayout from "@/layouts/app-layout";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useTenancyStore } from "@/zustand/stores/tenancy-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  FileText,
  Download,
  CreditCard,
  Building2,
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
    case "upcoming":
      return "bg-blue-500 text-white";
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rent Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rent Overview</CardTitle>
                    <CardDescription>
                      Your monthly rent amount, payment schedule, and property
                      details
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn(
                      getTenancyStatusBadge(selectedTenancy.status)
                    )}
                  >
                    {selectedTenancy.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Rent
                    </p>
                    <p className="text-3xl font-bold">
                      ₹{selectedTenancy.rent?.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                      {selectedTenancy.rent?.cycle || "monthly"} cycle
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedTenancy.rent?.dueDateDay && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Due Date
                        </p>
                        <p className="font-semibold">
                          {selectedTenancy.rent.dueDateDay}
                          {getOrdinalSuffix(selectedTenancy.rent.dueDateDay)} of
                          each month
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Utilities
                      </p>
                      <p className="font-semibold">
                        {selectedTenancy.rent?.utilitiesIncluded
                          ? "Included"
                          : "Not included"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Property Unit
                      </p>
                      <p className="font-semibold">
                        {typeof selectedTenancy.unitId === "object" &&
                        selectedTenancy.unitId?.title
                          ? selectedTenancy.unitId.title
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Landlord
                      </p>
                      <p className="font-semibold">
                        {typeof selectedTenancy.ownerId === "object" &&
                        selectedTenancy.ownerId
                          ? `${selectedTenancy.ownerId.firstName || ""} ${selectedTenancy.ownerId.lastName || ""}`.trim() ||
                            selectedTenancy.ownerId.email ||
                            "—"
                          : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              {selectedTenancy.payments &&
                selectedTenancy.payments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Payments</CardTitle>
                      <CardDescription>
                        Your latest rent payment transactions and receipts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTenancy.payments
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .slice(0, 5)
                        .map((payment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="font-semibold">
                                  ₹{payment.amount.toLocaleString()}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  Paid
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(
                                    parseISO(payment.date),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                                {payment.method && (
                                  <span className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    {payment.method}
                                  </span>
                                )}
                              </div>
                            </div>
                            {payment.receiptUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={payment.receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      {selectedTenancy.payments.length > 5 && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href="/my-rent/history">
                            View All Payment History
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deposit */}
              {selectedTenancy.deposit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Deposit</CardTitle>
                    <CardDescription>
                      The security deposit amount and its current status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xl font-bold mb-1">
                        ₹{selectedTenancy.deposit.amount?.toLocaleString() || 0}
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

              {/* Agreement */}
              {selectedTenancy.agreement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agreement</CardTitle>
                    <CardDescription>
                      View and download your rental agreement documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTenancy.agreement.agreementId && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link
                          href={`/my-agreement/${selectedTenancy.agreement.agreementId}`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Agreement
                        </Link>
                      </Button>
                    )}
                    {selectedTenancy.agreement.pdfUrl && (
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={selectedTenancy.agreement.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
