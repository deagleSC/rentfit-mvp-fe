import { BreadcrumbItemData } from "@/enums/ui-enums";
import AppLayout from "@/layouts/app-layout";

const breadcrumbs: BreadcrumbItemData[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    isCurrentPage: true,
  },
];

export default function DashboardPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div>Dashboard</div>
    </AppLayout>
  );
}
