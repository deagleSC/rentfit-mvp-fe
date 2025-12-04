"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/layouts/app-layout";
import { usePropertyStore } from "@/zustand/stores/property-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Navigation } from "lucide-react";
import Image from "next/image";
import { getUnitStatusStyle } from "@/lib/formatting-utils";
import { cn } from "@/lib/utils";

const breadcrumbs = [
  {
    title: "Properties",
    href: "/properties",
  },
  {
    title: "All Units",
    href: "/properties/units",
  },
  {
    title: "Unit Details",
    isCurrentPage: true,
  },
];

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) => (
  <div className="flex items-start justify-between py-3 border-b last:border-0">
    <span className="text-sm font-medium text-muted-foreground min-w-[140px]">
      {label}
    </span>
    <span className="text-sm text-foreground text-right flex-1">{value}</span>
  </div>
);

export default function UnitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedUnit, getUnitById, isUnitsLoading, setSelectedUnit } =
    usePropertyStore();
  const unitId = params.id as string;

  useEffect(() => {
    if (unitId) {
      getUnitById(unitId).then((unit) => {
        if (unit) {
          setSelectedUnit(unit);
        }
      });
    }

    return () => {
      setSelectedUnit(null);
    };
  }, [unitId, getUnitById, setSelectedUnit]);

  if (isUnitsLoading) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        title="Unit Details"
        subtitle="View the details of the unit"
      >
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-2 gap-8">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!selectedUnit) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        title="Unit Details"
        subtitle="View the details of the unit"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Unit not found</p>
          <Button onClick={() => router.push("/properties/units")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Units
          </Button>
        </div>
      </AppLayout>
    );
  }

  const address = selectedUnit.address;
  const addressParts = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.pincode,
  ].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinates = (coordinates?: number[]) => {
    if (!coordinates || coordinates.length < 2) return "—";
    return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Unit Details"
      subtitle="View the details of the unit"
    >
      <div className="space-y-8">
        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-semibold mb-2">
                      {selectedUnit.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Property Unit Information
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      getUnitStatusStyle(selectedUnit.status),
                      "text-xs font-medium capitalize px-3 py-1"
                    )}
                  >
                    {selectedUnit.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Key Specifications */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                    Specifications
                  </h3>
                  <div className="space-y-0">
                    <InfoRow
                      label="Bedrooms"
                      value={selectedUnit.beds ?? "—"}
                    />
                    <InfoRow
                      label="Area"
                      value={
                        selectedUnit.areaSqFt
                          ? `${selectedUnit.areaSqFt.toLocaleString()} sq ft`
                          : "—"
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </h3>
                  <div className="space-y-0">
                    {address?.line1 && (
                      <InfoRow label="Address Line 1" value={address.line1} />
                    )}
                    {address?.line2 && (
                      <InfoRow label="Address Line 2" value={address.line2} />
                    )}
                    {address?.city && (
                      <InfoRow label="City" value={address.city} />
                    )}
                    {address?.state && (
                      <InfoRow label="State" value={address.state} />
                    )}
                    {address?.pincode && (
                      <InfoRow label="Pincode" value={address.pincode} />
                    )}
                    {!fullAddress && (
                      <div className="py-3 text-sm text-muted-foreground">
                        No address information available
                      </div>
                    )}
                  </div>
                </div>

                {/* Geographic Information */}
                {selectedUnit.geo && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Navigation className="h-3.5 w-3.5" />
                        Geographic Data
                      </h3>
                      <div className="space-y-0">
                        <InfoRow
                          label="Type"
                          value={selectedUnit.geo.type || "—"}
                        />
                        <InfoRow
                          label="Coordinates"
                          value={
                            selectedUnit.geo.coordinates ? (
                              <span className="font-mono text-xs">
                                {formatCoordinates(
                                  selectedUnit.geo.coordinates
                                )}
                              </span>
                            ) : (
                              "—"
                            )
                          }
                        />
                        {selectedUnit.geo.coordinates &&
                          selectedUnit.geo.coordinates.length >= 2 && (
                            <div className="pt-3">
                              <a
                                href={`https://www.google.com/maps?q=${selectedUnit.geo.coordinates[1]},${selectedUnit.geo.coordinates[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1.5"
                              >
                                <MapPin className="h-3 w-3" />
                                View on Google Maps
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}

                {/* Metadata */}
                {(selectedUnit.createdAt || selectedUnit.updatedAt) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Metadata
                      </h3>
                      <div className="space-y-0">
                        {selectedUnit.createdAt && (
                          <InfoRow
                            label="Created"
                            value={formatDateTime(selectedUnit.createdAt)}
                          />
                        )}
                        {selectedUnit.updatedAt && (
                          <InfoRow
                            label="Last Updated"
                            value={formatDateTime(selectedUnit.updatedAt)}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Photos & Identifiers (1/3 width) */}
          <div className="space-y-8">
            {/* Photos Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Photos
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedUnit.photos && selectedUnit.photos.length > 0
                    ? `${selectedUnit.photos.length} image${
                        selectedUnit.photos.length > 1 ? "s" : ""
                      }`
                    : "No images available"}
                </p>
              </CardHeader>
              <CardContent>
                {selectedUnit.photos && selectedUnit.photos.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUnit.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-video w-full overflow-hidden rounded border bg-muted"
                      >
                        <Image
                          src={photo}
                          alt={`${selectedUnit.title} - Photo ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      No photos available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Identifiers Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Identifiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Unit ID
                  </p>
                  <p className="font-mono text-xs break-all text-foreground bg-muted/50 p-2 rounded border">
                    {selectedUnit._id || "—"}
                  </p>
                </div>
                {selectedUnit.ownerId && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Owner ID
                      </p>
                      <p className="font-mono text-xs break-all text-foreground bg-muted/50 p-2 rounded border">
                        {selectedUnit.ownerId}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
