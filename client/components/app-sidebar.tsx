import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// import { GalleryVerticalEnd } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  ArrowLeftRight,
  ChevronRight,
  Banknote,
} from "lucide-react";
import { UserProfileButton } from "./user/UserProfileButton";

// This is sample data.
const navItems = [
  {
    title: "Main menu",
    url: "#",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        path: "dashboard",
      },
      {
        title: "Employees",
        url: "/employees",
        icon: Users,
        path: "employees",
      },
      {
        title: "Payroll",
        url: "/payroll",
        icon: Banknote,
        path: "payroll",
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: ArrowLeftRight,
        path: "transactions",
      },
      {
        title: "Help & Center",
        url: "/help",
        icon: HelpCircle,
        path: "help",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Determine active route for highlighting
  const getIsActive = (path: string) => {
    return pathname?.includes(path);
  };

  return (
    <Sidebar
      variant="floating"
      className="bg-gradient-to-b from-purple-50 to-purple-100 border-r border-purple-200"
      {...props}
    >
      <SidebarHeader className="py-6">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-1">
              {/* User Profile Button positioned to the left of the logo */}
              <div className="ml-1">
                <UserProfileButton />
              </div>

              <SidebarMenuButton className="p-0" size="lg" asChild>
                <Link
                  href="/"
                  className="flex items-center transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                      Compensate
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((section) => (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton asChild>
                  <div className="font-semibold text-lg text-purple-800 opacity-70 pl-2 mb-2">
                    {section.title}
                  </div>
                </SidebarMenuButton>
                {section.items?.length ? (
                  <SidebarMenuSub className="space-y-1 mt-3">
                    {section.items.map((item) => {
                      const isActive = getIsActive(item.path);
                      return (
                        <SidebarMenuSubItem
                          key={item.title}
                          className="flex flex-row items-center"
                        >
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={item.url}
                              className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                                transition-all duration-200 group relative
                                ${
                                  isActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-purple-400/10 text-purple-800"
                                    : "text-gray-600 hover:bg-purple-100/50 hover:text-purple-700"
                                }
                              `}
                            >
                              <span
                                className={`
                                ${
                                  isActive
                                    ? "text-purple-600"
                                    : "text-gray-500 group-hover:text-purple-600"
                                }
                                transition-colors duration-200
                              `}
                              >
                                <item.icon size={20} />
                              </span>
                              <span>{item.title}</span>
                              {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full" />
                              )}
                              {isActive && (
                                <ChevronRight
                                  size={16}
                                  className="ml-auto text-purple-600"
                                />
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
