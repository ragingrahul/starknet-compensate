"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { WalletControls } from "@/components/wallet";
import { useCompany } from "@/lib/auth-context";
import { useWallet } from "@/lib/wallet-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const pathMap: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  payroll: "Payroll",
  transactions: "Transactions",
  help: "Help & Center",
};

function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useCompany();
  const { isConnected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
    return (
      pathMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push("/");
    } else if (!isLoading && isConnected && !isAdmin) {
      router.push("/setup");
    }
  }, [isLoading, isConnected, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-purple-border-secondary border-b px-4">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-purple-bg-dark2"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Main menu</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <WalletControls />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default EmployerLayout;
