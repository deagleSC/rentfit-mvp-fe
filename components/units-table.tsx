"use client";

import { DataTable } from "./data-table";
import { Unit } from "@/types/property-types";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { usePropertyStore } from "@/zustand/stores/property-store";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { getUnitStatusStyle } from "@/lib/formatting-utils";

export function UnitsTable() {
  const { units, getUnits } = usePropertyStore();
  const { currentUser } = useAuthStore();
  const router = useRouter();

  const columns: ColumnDef<Unit>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }) => {
        const address = row.original.address;
        const addressParts = [
          address?.line1,
          address?.line2,
          address?.city,
          address?.state,
          address?.pincode,
        ].filter(Boolean);
        return (
          <div className="flex items-center gap-1">
            {addressParts.length > 0 ? (
              <span>{addressParts.join(", ")}</span>
            ) : (
              <span className="text-muted-foreground">No address</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge className={getUnitStatusStyle(status)}>{status}</Badge>;
      },
    },
  ];

  useEffect(() => {
    if (currentUser) {
      getUnits(currentUser?._id);
    }
  }, [currentUser, getUnits]);

  const handleRowClick = (unit: Unit) => {
    if (unit._id) {
      router.push(`/properties/units/${unit._id}`);
    }
  };

  return (
    <div>
      <DataTable columns={columns} data={units} onRowClick={handleRowClick} />
    </div>
  );
}
