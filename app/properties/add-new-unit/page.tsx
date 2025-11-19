import { AddNewUnitForm } from "@/components/add-new-unit-form";
import AppLayout from "@/layouts/app-layout";

const breadcrumbs = [
  {
    title: "Properties",
    href: "/properties",
  },
  {
    title: "Add New Unit",
    href: "/properties/add-new-unit",
  },
];
export default function AddNewUnitPage() {
  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      title="Add New Unit"
      subtitle="Add a new unit to your property"
    >
      <AddNewUnitForm />
    </AppLayout>
  );
}
