"use client";

import AppLayout from "@/layouts/app-layout";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { usePropertyStore } from "@/zustand/stores/property-store";
import { useTenancyWizardStore } from "@/zustand/stores/tenancy-wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { getUnitStatusStyle } from "@/lib/formatting-utils";
import { cn } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Home,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  PenTool,
  FileCheck,
  Download,
  Loader2,
  X,
  AlertCircle,
  Shield,
} from "lucide-react";
import { getUsersService } from "@/zustand/services/user-services";
import { User as UserType } from "@/types/user-types";
import { RentDetailsForm } from "@/components/rent-details-form";
import { ClausesForm } from "@/components/clauses-form";
import { useAgreementStore } from "@/zustand/stores/agreement-store";
import { toast } from "sonner";
import { createTenancyService } from "@/zustand/services/tenancy-services";
import { ApiError } from "@/lib/api-utils";

const breadcrumbs = [
  { title: "Tenancies", href: "/tenancies" },
  {
    title: "New Tenancy",
    href: "/tenancies/add-new-tenancy",
    isCurrentPage: true,
  },
];

export default function AddNewTenancyPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { units, getUnits, isUnitsLoading } = usePropertyStore();
  const {
    step,
    selectedUnit,
    selectedTenant,
    setSelectedUnit,
    setSelectedTenant,
    setStep,
    formData,
    agreementId,
    resetWizard,
  } = useTenancyWizardStore();
  const { currentAgreement, signAgreement, isSigning, getAgreementById } =
    useAgreementStore();
  const isMobile = useIsMobile();

  const [tenants, setTenants] = useState<UserType[]>([]);
  const [isTenantsLoading, setIsTenantsLoading] = useState(false);
  const [isCreatingTenancy, setIsCreatingTenancy] = useState(false);
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      void getUnits(currentUser._id);
    }
  }, [currentUser?._id, getUnits]);

  useEffect(() => {
    const fetchTenants = async () => {
      setIsTenantsLoading(true);
      try {
        const fetchedTenants = await getUsersService({
          role: "tenant",
          limit: 100,
        });
        setTenants(fetchedTenants);
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
        // Reset wizard state on 404 error
        if (error instanceof ApiError && error.statusCode === 404) {
          resetWizard();
          setStep(1);
          toast.error("Resource not found. Wizard has been reset.");
        }
      } finally {
        setIsTenantsLoading(false);
      }
    };

    void fetchTenants();
  }, [resetWizard, setStep]);

  // Fetch agreement when navigating to step 4 if agreementId exists
  useEffect(() => {
    const fetchAgreement = async () => {
      if (step === 4 && agreementId && !currentAgreement) {
        try {
          await getAgreementById(agreementId);
        } catch (error) {
          console.error("Failed to fetch agreement:", error);
          // Reset wizard state on 404 error
          if (error instanceof ApiError && error.statusCode === 404) {
            resetWizard();
            setStep(1);
            toast.error("Agreement not found. Wizard has been reset.");
          }
        }
      }
    };
    void fetchAgreement();
  }, [
    step,
    agreementId,
    currentAgreement,
    getAgreementById,
    resetWizard,
    setStep,
  ]);

  // Reset signing state when navigating away from step 4
  useEffect(() => {
    if (step !== 4) {
      setHasReadAgreement(false);
      setSignatureName("");
      setShowConfirmDialog(false);
    }
  }, [step]);

  // Helper function to check if current user has signed
  const hasUserSigned = useMemo(() => {
    if (!currentAgreement || !currentUser) return false;
    // Check if user has signed by comparing userId (handle both string and object IDs)
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

  // Pre-populate signature fields if user has already signed
  useEffect(() => {
    if (currentAgreement && currentUser && step === 4) {
      const userSignature = currentAgreement.signers?.find(
        (signer) => String(signer.userId) === String(currentUser._id)
      );
      if (userSignature?.signedAt) {
        // User has already signed
        setHasReadAgreement(true);
        setSignatureName(
          userSignature.name ||
            `${currentUser.firstName} ${currentUser.lastName}`
        );
      } else {
        // Reset to default
        setHasReadAgreement(false);
        setSignatureName("");
      }
    }
  }, [currentAgreement, currentUser, step]);

  const handleSelectUnit = (unitId: string) => {
    const unit = units.find((u) => u._id === unitId) || null;
    setSelectedUnit(unit);
  };

  const handleSelectTenant = (tenantId: string) => {
    const tenant = tenants.find((t) => t._id === tenantId) || null;
    setSelectedTenant(tenant);
  };

  const handleContinue = () => {
    if (selectedUnit && selectedTenant) {
      setStep(2);
    }
  };

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
        // Move to Review step after signing
        setStep(5);
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
      // Reset wizard state on 404 error
      if (error instanceof ApiError && error.statusCode === 404) {
        resetWizard();
        setStep(1);
        toast.error("Agreement not found. Wizard has been reset.");
      } else {
        toast.error("Failed to sign agreement");
      }
      setShowConfirmDialog(false);
    }
  };

  const handleCreateTenancy = async () => {
    if (
      !selectedUnit ||
      !selectedTenant ||
      !currentUser ||
      !formData ||
      !agreementId
    ) {
      toast.error("Missing required information");
      return;
    }

    setIsCreatingTenancy(true);
    try {
      const tenancy = await createTenancyService({
        unitId: selectedUnit._id || "",
        ownerId: currentUser._id,
        tenantId: selectedTenant._id || "",
        agreementId: agreementId,
        rent: formData.rent,
        deposit: formData.deposit,
        // Status defaults to 'upcoming' in the backend
      });

      if (tenancy) {
        toast.success("Tenancy created successfully!");
        // Reset the wizard state
        resetWizard();
        // Redirect to all tenancies page
        router.push("/tenancies");
      }
    } catch (error) {
      console.error("Error creating tenancy:", error);
      // Reset wizard state on 404 error
      if (error instanceof ApiError && error.statusCode === 404) {
        resetWizard();
        setStep(1);
        toast.error("Resource not found. Wizard has been reset.");
      } else {
        toast.error("Failed to create tenancy");
      }
    } finally {
      setIsCreatingTenancy(false);
    }
  };

  const handleDiscardAndReset = () => {
    resetWizard();
    setStep(1);
    toast.info("Form reset. Starting from the beginning.");
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Create New Tenancy"
      subtitle="Complete the steps below to create a new tenancy agreement"
    >
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Minimalist Step Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 w-full">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div key={stepNum} className="flex items-center gap-2 sm:gap-4">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  step >= stepNum
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stepNum}
              </div>
              {stepNum < 5 && (
                <div
                  className={cn(
                    "h-0.5 w-8 sm:w-12 transition-colors",
                    step > stepNum ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Unit & Tenant */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Unit Selection Section */}
            <div>
              <h3 className="text-base font-semibold mb-4">Select Unit</h3>
              {isUnitsLoading ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border">
                      <CardContent className="p-4 sm:p-6">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : units.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted mb-4">
                    <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
                    No Units Available
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    You need to add at least one property unit before creating a
                    tenancy agreement.
                  </p>
                  <Button asChild className="gap-2 w-full sm:w-auto">
                    <a href="/properties/add-new-unit">
                      <PlusCircle className="h-4 w-4" />
                      Add New Unit
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {units.map((unit) => {
                    const isSelected = selectedUnit?._id === unit._id;
                    const addressParts = [
                      unit.address?.line1,
                      unit.address?.city,
                      unit.address?.state,
                      unit.address?.pincode,
                    ].filter(Boolean);

                    return (
                      <button
                        key={unit._id}
                        type="button"
                        onClick={() => unit._id && handleSelectUnit(unit._id)}
                        disabled={isTenantsLoading}
                        className={cn(
                          "group relative flex flex-col text-left rounded-lg border transition-all duration-200",
                          "hover:shadow-md hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "active:scale-[0.98] sm:active:scale-100",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-accent/50"
                        )}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                            <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground shadow-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col p-4 sm:p-6 gap-3 sm:gap-4">
                          {/* Header */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0",
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight">
                                    {unit.title}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {addressParts.length > 0 && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed">
                                  {addressParts.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Bedrooms
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-foreground">
                                {unit.beds ? `${unit.beds} BHK` : "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Area
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-foreground">
                                {unit.areaSqFt
                                  ? `${unit.areaSqFt.toLocaleString()} sq ft`
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] sm:text-xs font-medium capitalize px-2 sm:px-2.5 py-0.5 sm:py-1",
                                getUnitStatusStyle(unit.status)
                              )}
                            >
                              {unit.status}
                            </Badge>
                            {isSelected && (
                              <span className="text-[10px] sm:text-xs font-medium text-primary flex items-center gap-1 sm:gap-1.5">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tenant Selection Section */}
            <div>
              <h3 className="text-base font-semibold mb-4">Select Tenant</h3>
              {isTenantsLoading ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border">
                      <CardContent className="p-4 sm:p-6">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted mb-4">
                    <User className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
                    No Tenants Available
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    No tenants found in the system. Please ensure tenants are
                    registered.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {tenants.map((tenant) => {
                    const isSelected = selectedTenant?._id === tenant._id;

                    return (
                      <button
                        key={tenant._id}
                        type="button"
                        onClick={() =>
                          tenant._id && handleSelectTenant(tenant._id)
                        }
                        disabled={isUnitsLoading}
                        className={cn(
                          "group relative flex flex-col text-left rounded-lg border transition-all duration-200",
                          "hover:shadow-md hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "active:scale-[0.98] sm:active:scale-100",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-accent/50"
                        )}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                            <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground shadow-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col p-4 sm:p-6 gap-3 sm:gap-4">
                          {/* Header */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0",
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight">
                                    {tenant.firstName} {tenant.lastName}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {tenant.email && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                                <span className="line-clamp-1 leading-relaxed">
                                  {tenant.email}
                                </span>
                              </div>
                            )}

                            {tenant.phone && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                                <span className="line-clamp-1 leading-relaxed">
                                  {tenant.phone}
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Status Badge */}
                          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] sm:text-xs font-medium capitalize px-2 sm:px-2.5 py-0.5 sm:py-1",
                                tenant.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              )}
                            >
                              {tenant.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {isSelected && (
                              <span className="text-[10px] sm:text-xs font-medium text-primary flex items-center gap-1 sm:gap-1.5">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Continue Button at Bottom */}
            {selectedUnit && selectedTenant && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDiscardAndReset}
                  className="gap-2 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Discard and Reset
                </Button>
                <Button
                  onClick={handleContinue}
                  className="gap-2 w-full sm:w-auto"
                  size="default"
                >
                  Continue to Rent Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {(!selectedUnit || !selectedTenant) && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDiscardAndReset}
                  className="gap-2 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Discard and Reset
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Rent Details */}
        {step === 2 && (
          <RentDetailsForm onDiscardAndReset={handleDiscardAndReset} />
        )}

        {/* Step 3: Agreement Clauses */}
        {step === 3 && (
          <ClausesForm onDiscardAndReset={handleDiscardAndReset} />
        )}

        {/* Step 4: Sign Agreement */}
        {step === 4 && currentAgreement && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Agreement Status:{" "}
                  <Badge variant="secondary" className="ml-2">
                    {currentAgreement.status}
                  </Badge>
                </p>
                {currentAgreement.pdfUrl && (
                  <div className="mt-4 space-y-4">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={currentAgreement.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Agreement PDF
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Signing Section */}
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
                            : currentAgreement.signers?.some(
                                  (s) =>
                                    s.userId === currentUser?._id && s.signedAt
                                )
                              ? "You have already signed this agreement"
                              : "Please review the agreement carefully before signing"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Already Signed Message */}
                    {currentAgreement.status === "signed" && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                              Agreement Fully Signed
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                              This agreement has been fully signed by all
                              parties and is now legally binding.
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
                              You have already signed this agreement. Waiting
                              for other parties to sign.
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
                                By signing this agreement, you acknowledge that
                                you have read, understood, and agree to be
                                legally bound by all terms and conditions
                                contained in this document. Your electronic
                                signature has the same legal effect as a
                                handwritten signature.
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
                              I confirm that I have read, understood, and agree
                              to all terms and conditions outlined in this
                              agreement. I understand that this is a legally
                              binding document and my signature will be recorded
                              with a timestamp.
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
                      </>
                    )}

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

                    {/* Action Buttons */}
                    {!showConfirmDialog && (
                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDiscardAndReset}
                          className="gap-2 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          Discard and Reset
                        </Button>
                        <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(3)}
                            className="w-full sm:w-auto"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          {/* Show sign button if agreement is not fully signed and user hasn't signed */}
                          {currentAgreement.status !== "signed" &&
                          !hasUserSigned ? (
                            <Button
                              onClick={handleSignAgreement}
                              disabled={
                                isSigning ||
                                !hasReadAgreement ||
                                !signatureName.trim()
                              }
                              className="gap-2 w-full sm:w-auto"
                            >
                              <PenTool className="h-4 w-4" />
                              Proceed to Sign
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => setStep(5)}
                              className="gap-2 w-full sm:w-auto"
                            >
                              Continue to Review
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 5: Review & Create Tenancy */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Review & Create Tenancy
              </h3>
              <p className="text-sm text-muted-foreground">
                Review all the details below and create the tenancy once
                you&apos;re satisfied with the information.
              </p>
            </div>

            {/* Review Summary */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted">
              <div className="space-y-6">
                {/* Unit Information */}
                {selectedUnit && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Unit Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {selectedUnit.title}
                      </p>
                      {selectedUnit.address && (
                        <p className="text-sm text-muted-foreground">
                          {[
                            selectedUnit.address.line1,
                            selectedUnit.address.city,
                            selectedUnit.address.state,
                            selectedUnit.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tenant Information */}
                {selectedTenant && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Tenant Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {selectedTenant.firstName} {selectedTenant.lastName}
                      </p>
                      {selectedTenant.email && (
                        <p className="text-sm text-muted-foreground">
                          {selectedTenant.email}
                        </p>
                      )}
                      {selectedTenant.phone && (
                        <p className="text-sm text-muted-foreground">
                          {selectedTenant.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rent Details */}
                {formData?.rent && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Rent Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Amount:</span> ₹
                        {formData.rent.amount.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Cycle:</span>{" "}
                        {formData.rent.cycle}
                      </p>
                      {formData.rent.dueDateDay && (
                        <p className="text-sm">
                          <span className="font-medium">Due Date:</span> Day{" "}
                          {formData.rent.dueDateDay} of each month
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Utilities Included:</span>{" "}
                        {formData.rent.utilitiesIncluded ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Deposit Details */}
                {formData?.deposit && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Deposit Details
                    </h4>
                    <div className="space-y-1">
                      {formData.deposit.amount && (
                        <p className="text-sm">
                          <span className="font-medium">Amount:</span> ₹
                          {formData.deposit.amount.toLocaleString()}
                        </p>
                      )}
                      {formData.deposit.status && (
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          {formData.deposit.status}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Agreement Status */}
                {currentAgreement && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Agreement Status
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant="secondary">
                          {currentAgreement.status}
                        </Badge>
                      </p>
                      {currentAgreement.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mt-2"
                        >
                          <a
                            href={currentAgreement.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            View Agreement PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Tenancy Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDiscardAndReset}
                className="gap-2 w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                Discard and Reset
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateTenancy}
                  disabled={isCreatingTenancy}
                  className="w-full sm:w-auto gap-2"
                >
                  {isCreatingTenancy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Tenancy...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Tenancy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
