"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ClientOnly } from "@/components/client-only";

// import NimbusLogo from "@/assets/logo5.svg";
import Image from "next/image";

export function SidebarBranding(props: SidebarMenuProps) {
  const { name, logo, plan } = props;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ClientOnly
          fallback={
            <SidebarMenuButton size="lg">
              <Image src={logo} alt={name} width={36} height={36} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{plan}</span>
              </div>
            </SidebarMenuButton>
          }
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Image src={logo} alt={name} width={36} height={36} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs">{plan}</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </ClientOnly>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface SidebarMenuProps {
  name: string;
  logo: string;
  plan: string;
}
