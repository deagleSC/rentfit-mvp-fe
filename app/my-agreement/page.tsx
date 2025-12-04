"use client";

import AppLayout from "@/layouts/app-layout";
import { useEffect } from "react";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useAgreementStore } from "@/zustand/stores/agreement-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Calendar,
  Download,
  PenTool,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const breadcrumbs = [
  {
    title: "My Agreement",
    href: "/my-agreement",
    isCurrentPage: true,
  },
];

const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case "signed":
      return "bg-green-500 text-white";
    case "pending_signature":
      return "bg-yellow-500 text-white";
    case "draft":
      return "bg-gray-500 text-white";
    case "cancelled":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "signed":
      return <CheckCircle2 className="h-4 w-4" />;
    case "pending_signature":
      return <PenTool className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function MyAgreementPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { agreements, getAgreements, isAgreementsLoading } =
    useAgreementStore();

  useEffect(() => {
    if (currentUser?._id) {
      // Fetch agreements where the current user is the tenant
      getAgreements({ tenantId: currentUser._id, limit: 100 });
    }
  }, [currentUser?._id, getAgreements]);

  const handleCardClick = (agreementId: string) => {
    router.push(`/my-agreement/${agreementId}`);
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="My Agreements"
      subtitle="View and manage all your agreements"
    >
      <div className="space-y-6">
        {isAgreementsLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agreements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted mb-4">
              <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
              No Agreements Found
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You don&apos;t have any agreements yet. Create a new tenancy to
              generate an agreement.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {agreements.map((agreement) => (
              <Card
                key={agreement._id}
                className="border cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary/50"
                onClick={() => handleCardClick(agreement._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base line-clamp-2">
                          {agreement.templateName
                            ? `Agreement - ${agreement.templateName}`
                            : "Agreement"}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs font-medium shrink-0",
                        getStatusBadgeVariant(agreement.status)
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(agreement.status)}
                        {agreement.status || "draft"}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agreement.version && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Version:</span>
                      <span>{agreement.version}</span>
                    </div>
                  )}
                  {agreement.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        Created:{" "}
                        {format(new Date(agreement.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  {agreement.lastSignedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Signed:{" "}
                        {format(
                          new Date(agreement.lastSignedAt),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}
                  {agreement.signers && agreement.signers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Signers:</span>
                      <span>{agreement.signers.length}</span>
                    </div>
                  )}
                  {agreement.pdfUrl && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Download className="h-4 w-4" />
                        <span>PDF Available</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
