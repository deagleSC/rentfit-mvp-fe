import AppLayout from "@/layouts/app-layout";
import { UnitsTable } from "@/components/units-table";

const breadcrumbs = [
  {
    title: "Properties",
    href: "/properties",
  },
  {
    title: "All Units",
    href: "/properties/all-units",
  },
];

export default function AllUnitsPage() {
  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="All Units"
      subtitle="View all units for your property"
    >
      <div>
        <UnitsTable />
      </div>
    </AppLayout>
  );
}
