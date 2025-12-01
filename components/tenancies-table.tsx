"use client";

import { DataTable } from "./data-table";
import { Tenancy } from "@/types/tenancy-types";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { useTenancyStore } from "@/zustand/stores/tenancy-store";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

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

const getTenancyStatusStyle = (status: string) => {
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

export function TenanciesTable() {
  const { tenancies, getTenancies, isTenanciesLoading } = useTenancyStore();
  const { currentUser } = useAuthStore();

  const columns: ColumnDef<PopulatedTenancy>[] = [
    {
      header: "Unit",
      accessorKey: "unitId",
      cell: ({ row }) => {
        const unit = row.original.unitId;
        if (typeof unit === "object" && unit?.title) {
          return <span>{unit.title}</span>;
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: "Tenant",
      accessorKey: "tenantId",
      cell: ({ row }) => {
        const tenant = row.original.tenantId;
        if (typeof tenant === "object" && tenant) {
          const name = [tenant.firstName, tenant.lastName]
            .filter(Boolean)
            .join(" ");
          return <span>{name || tenant.email || "—"}</span>;
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: "Rent",
      accessorKey: "rent",
      cell: ({ row }) => {
        const rent = row.original.rent;
        if (rent?.amount) {
          return (
            <span>
              ₹{rent.amount.toLocaleString()}/{rent.cycle || "monthly"}
            </span>
          );
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={cn(getTenancyStatusStyle(status))}>{status}</Badge>
        );
      },
    },
  ];

  useEffect(() => {
    if (currentUser) {
      // Filter by ownerId for landlords
      getTenancies({ ownerId: currentUser._id });
    }
  }, [currentUser, getTenancies]);

  const handleRowClick = (tenancy: PopulatedTenancy) => {
    if (tenancy._id) {
      // You can navigate to tenancy details page if it exists
      // router.push(`/tenancies/${tenancy._id}`);
    }
  };

  if (isTenanciesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading tenancies...</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={tenancies as PopulatedTenancy[]}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
