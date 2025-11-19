"use client";

import * as React from "react";
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Receipt,
  Upload,
  Wallet,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarBranding } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/zustand/stores/auth-store";
import { UserRole } from "@/enums/user-enums";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAuthStore();

  const tenantNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Rent",
      url: "/my-rent",
      icon: Wallet,
      items: [
        {
          title: "Rent Status",
          url: "/my-rent/status",
        },
        {
          title: "Payment History",
          url: "/my-rent/history",
        },
      ],
    },
    {
      title: "Evidence Uploads",
      url: "/evidence-uploads",
      icon: Upload,
    },
    {
      title: "My Agreement",
      url: "/my-agreement",
      icon: FileText,
    },
  ];

  const landlordNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Properties",
      url: "/properties",
      icon: Building2,
      items: [
        {
          title: "All Units",
          url: "/properties/units",
        },
        {
          title: "Add New Unit",
          url: "/properties/add-new-unit",
        },
      ],
    },
    {
      title: "Tenancies",
      url: "/tenancies",
      icon: ClipboardList,
      items: [
        {
          title: "Active Tenancies",
          url: "/tenancies/active",
        },
        {
          title: "Pending / Upcoming",
          url: "/tenancies/upcoming",
        },
      ],
    },
    {
      title: "Rent Tracking",
      url: "/rent-tracking",
      icon: Receipt,
      items: [
        {
          title: "Payments",
          url: "/rent-tracking/payments",
        },
        {
          title: "Receipts",
          url: "/rent-tracking/receipts",
        },
      ],
    },
    {
      title: "Reminders",
      url: "/reminders",
      icon: Bell,
    },
    {
      title: "Evidence & Documents",
      url: "/evidence-documents",
      icon: FolderArchive,
    },
    {
      title: "Agreement Builder",
      url: "/agreement-builder",
      icon: FileText,
    },
  ];

  const role = currentUser?.role ?? UserRole.TENANT;

  const data = {
    teams: [
      {
        name: "RentFit",
        logo: "/favicon.ico",
        plan: "Pro",
      },
    ],
    navMain: role === UserRole.LANDLORD ? landlordNav : tenantNav,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBranding
          name={data.teams[0].name}
          logo={data.teams[0].logo}
          plan={data.teams[0].plan}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
