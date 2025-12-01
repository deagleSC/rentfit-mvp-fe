"use client";

import AppLayout from "@/layouts/app-layout";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useAgreementStore } from "@/zustand/stores/agreement-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  FileText,
  Calendar,
  Download,
  PenTool,
  CheckCircle2,
  ArrowLeft,
  User,
  AlertCircle,
  Shield,
  FileCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserRole } from "@/enums/user-enums";

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

export default function AgreementDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const agreementId = params.id as string;
  const { currentUser } = useAuthStore();
  const {
    currentAgreement,
    getAgreementById,
    signAgreement,
    isLoading,
    isSigning,
  } = useAgreementStore();
  const isMobile = useIsMobile();

  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (agreementId) {
      getAgreementById(agreementId);
    }
  }, [agreementId, getAgreementById]);

  const handleSignAgreement = async () => {
    if (!currentAgreement || !currentUser) {
      return;
    }

    // Validate signature requirements
    if (!hasReadAgreement) {
      toast.error(
        "Please confirm that you have read and understood the agreement"
      );
      return;
    }

    const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
    if (!signatureName.trim() || signatureName.trim() !== fullName.trim()) {
      toast.error(
        "Please enter your full name exactly as shown to sign the agreement"
      );
      return;
    }

    // Show confirmation dialog
    if (!showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    try {
      const signedAgreement = await signAgreement(currentAgreement._id, {
        userId: currentUser._id,
        name: signatureName.trim(),
        method: "manual",
      });

      if (signedAgreement) {
        toast.success("Agreement signed successfully!");
        // Reset signing state
        setHasReadAgreement(false);
        setSignatureName("");
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement");
      setShowConfirmDialog(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentAgreement?.pdfUrl) {
      window.open(currentAgreement.pdfUrl, "_blank");
    }
  };

  // Check if current user is a tenant
  const isTenant = currentUser?.role === UserRole.TENANT;

  // Check if current user is the tenant for this agreement
  const isAgreementTenant = currentAgreement?.tenantId === currentUser?._id;

  // Helper function to check if current user has signed (handle both string and object IDs)
  const hasUserSigned = useMemo(() => {
    if (!currentAgreement || !currentUser) return false;
    const userHasSigned = currentAgreement.signers?.some((s) => {
      const signerUserId =
        typeof s.userId === "object" && s.userId !== null && "_id" in s.userId
          ? String((s.userId as { _id: string })._id)
          : String(s.userId);
      const currentUserId = String(currentUser._id);
      return signerUserId === currentUserId && s.signedAt;
    });
    return userHasSigned || false;
  }, [currentAgreement, currentUser]);

  const isUserSigner = useMemo(() => {
    if (!currentAgreement || !currentUser) return false;
    return (
      currentAgreement.signers?.some((s) => {
        const signerUserId =
          typeof s.userId === "object" && s.userId !== null && "_id" in s.userId
            ? String((s.userId as { _id: string })._id)
            : String(s.userId);
        const currentUserId = String(currentUser._id);
        return signerUserId === currentUserId;
      }) || false
    );
  }, [currentAgreement, currentUser]);

  // For tenants: show "pending_signature" if they haven't signed, even if status is "signed"
  // For landlords: show the actual status
  const displayStatus = useMemo(() => {
    if (isTenant && isAgreementTenant && !hasUserSigned) {
      return "pending_signature";
    }
    return currentAgreement?.status || "draft";
  }, [isTenant, isAgreementTenant, hasUserSigned, currentAgreement?.status]);

  // Tenant can sign if they are the agreement tenant and haven't signed yet
  const canTenantSign = isTenant && isAgreementTenant && !hasUserSigned;

  const breadcrumbs = [
    {
      title: "My Agreement",
      href: "/my-agreement",
    },
    {
      title: "Agreement Details",
      href: `/my-agreement/${agreementId}`,
      isCurrentPage: true,
    },
  ];

  if (isLoading) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        title="Agreement Details"
        subtitle=""
      >
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

  if (!currentAgreement) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        title="Agreement Details"
        subtitle=""
      >
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Agreement not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/my-agreement")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agreements
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Agreement Details"
      subtitle="View and manage your agreement"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/my-agreement")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agreements
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {currentAgreement.pdfUrl && (
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>

        {/* Agreement Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>
                    {currentAgreement.templateName
                      ? `Agreement - ${currentAgreement.templateName}`
                      : "Agreement"}
                  </CardTitle>
                  {currentAgreement.version && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Version {currentAgreement.version}
                    </p>
                  )}
                </div>
              </div>
              <Badge
                className={cn(
                  "text-sm font-medium",
                  getStatusBadgeVariant(displayStatus)
                )}
              >
                {displayStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status and Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              {currentAgreement.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(currentAgreement.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              )}
              {currentAgreement.lastSignedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Last Signed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(currentAgreement.lastSignedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Signers */}
            {currentAgreement.signers &&
              currentAgreement.signers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Signers</h3>
                  <div className="space-y-2">
                    {currentAgreement.signers.map((signer, index) => {
                      const isCurrentUser = signer.userId === currentUser?._id;
                      const isSigned = signer.signedAt !== undefined;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            isCurrentUser && "bg-primary/5 border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full",
                                isSigned
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {signer.name || "Unknown"}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Method: {signer.method || "manual"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSigned ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-muted-foreground">
                                  {signer.signedAt &&
                                    format(
                                      new Date(signer.signedAt),
                                      "MMM dd, yyyy"
                                    )}
                                </span>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <Separator />

            {/* PDF Download */}
            {currentAgreement.pdfUrl && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Agreement Document
                </h3>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}

            {/* Clauses */}
            {currentAgreement.clauses &&
              currentAgreement.clauses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Clauses</h3>
                  <div className="space-y-3">
                    {currentAgreement.clauses.map((clause, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        {clause.key && (
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            {clause.key}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{clause.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Signing Section */}
        {/* Show signing section if user can sign, or show "already signed" messages */}
        {(canTenantSign ||
          (isUserSigner &&
            !hasUserSigned &&
            currentAgreement.status === "pending_signature") ||
          currentAgreement.status === "signed" ||
          hasUserSigned) && (
          <Card className="border-2">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <FileCheck className="h-5 w-5" />
                      Sign Agreement
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentAgreement.status === "signed"
                        ? "This agreement has been fully signed"
                        : hasUserSigned
                          ? "You have already signed this agreement"
                          : "Please review the agreement carefully before signing"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Agreement Fully Signed Message */}
                {currentAgreement.status === "signed" && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                          Agreement Fully Signed
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                          This agreement has been fully signed by all parties
                          and is now legally binding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Already Signed Message */}
                {currentAgreement.status !== "signed" && hasUserSigned && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          You Have Already Signed
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          You have already signed this agreement. Waiting for
                          other parties to sign.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signing Form - Only show if agreement is not fully signed and user hasn't signed */}
                {currentAgreement.status !== "signed" && !hasUserSigned && (
                  <>
                    {/* Legal Disclaimer */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                            Legal Notice
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            By signing this agreement, you acknowledge that you
                            have read, understood, and agree to be legally bound
                            by all terms and conditions contained in this
                            document. Your electronic signature has the same
                            legal effect as a handwritten signature.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                        <Checkbox
                          id="read-agreement"
                          checked={hasReadAgreement}
                          onCheckedChange={(checked) =>
                            setHasReadAgreement(checked === true)
                          }
                          className="mt-1"
                        />
                        <Label
                          htmlFor="read-agreement"
                          className="text-sm leading-relaxed cursor-pointer flex-1"
                        >
                          I confirm that I have read, understood, and agree to
                          all terms and conditions outlined in this agreement. I
                          understand that this is a legally binding document and
                          my signature will be recorded with a timestamp.
                        </Label>
                      </div>
                    </div>

                    {/* Signature Field */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="signature"
                        className="text-sm font-semibold"
                      >
                        Enter Your Full Name to Sign
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="signature"
                          type="text"
                          placeholder={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`}
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          className="h-12 text-base font-medium"
                          disabled={isSigning}
                        />
                        <p className="text-xs text-muted-foreground">
                          Type your full name exactly as shown above to
                          electronically sign this agreement
                        </p>
                      </div>
                    </div>

                    {/* Confirmation Dialog/Sheet - Responsive */}
                    {isMobile ? (
                      <Sheet
                        open={showConfirmDialog}
                        onOpenChange={setShowConfirmDialog}
                      >
                        <SheetContent side="bottom" className="h-auto">
                          <SheetHeader>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                <AlertCircle className="h-5 w-5 text-primary" />
                              </div>
                              <SheetTitle>Final Confirmation</SheetTitle>
                            </div>
                            <SheetDescription className="pt-4 text-left">
                              You are about to electronically sign this
                              agreement. This action is legally binding and
                              cannot be undone. Are you sure you want to
                              proceed?
                            </SheetDescription>
                          </SheetHeader>
                          <SheetFooter className="flex-col sm:flex-row gap-2 pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowConfirmDialog(false)}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSignAgreement}
                              disabled={isSigning}
                              className="w-full sm:w-auto"
                            >
                              {isSigning ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Signing...
                                </>
                              ) : (
                                <>
                                  <PenTool className="h-4 w-4 mr-2" />
                                  Confirm & Sign
                                </>
                              )}
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    ) : (
                      <Dialog
                        open={showConfirmDialog}
                        onOpenChange={setShowConfirmDialog}
                      >
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                <AlertCircle className="h-5 w-5 text-primary" />
                              </div>
                              <DialogTitle>Final Confirmation</DialogTitle>
                            </div>
                            <DialogDescription className="pt-4 text-left">
                              You are about to electronically sign this
                              agreement. This action is legally binding and
                              cannot be undone. Are you sure you want to
                              proceed?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowConfirmDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSignAgreement}
                              disabled={isSigning}
                            >
                              {isSigning ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Signing...
                                </>
                              ) : (
                                <>
                                  <PenTool className="h-4 w-4 mr-2" />
                                  Confirm & Sign
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Action Button - Only show if user can sign */}
                    {!showConfirmDialog && (
                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button
                          onClick={handleSignAgreement}
                          disabled={
                            isSigning ||
                            !hasReadAgreement ||
                            !signatureName.trim()
                          }
                          className="gap-2 w-full sm:w-auto sm:ml-auto"
                        >
                          <PenTool className="h-4 w-4" />
                          {isSigning ? "Signing..." : "Proceed to Sign"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
