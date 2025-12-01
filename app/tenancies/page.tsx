import AppLayout from "@/layouts/app-layout";
import { TenanciesTable } from "@/components/tenancies-table";

const breadcrumbs = [
  {
    title: "Tenancies",
    href: "/tenancies",
    isCurrentPage: true,
  },
];

export default function AllTenanciesPage() {
  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="All Tenancies"
      subtitle="View all tenancies for your properties"
    >
      <div>
        <TenanciesTable />
      </div>
    </AppLayout>
  );
}
