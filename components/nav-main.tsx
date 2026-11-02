"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  label,
  items,
}: {
  label: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}) {
  const pathname = usePathname();

  const isItemActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const shouldBeOpen = (item: (typeof items)[0]) => {
    if (item.isActive) return true;
    return item.items?.some((subItem) => isItemActive(subItem.url)) || false;
  };

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="text-[12px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap text-muted-foreground/70 px-2.5 h-6">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const active = isItemActive(item.url);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          "relative h-8.5 text-[15px] font-medium transition-colors cursor-pointer px-2.5 rounded-md",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {active && (
                          <span className="absolute inset-y-1.5 left-0 w-[2.5px] rounded-r-full bg-primary" />
                        )}
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "size-4 shrink-0",
                              active ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                        )}
                        <span className="truncate">{item.title}</span>
                        <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/70" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-3.5 border-l border-border/40 pl-2 my-0.5 space-y-0.5">
                        {item.items?.map((subItem) => {
                          const subActive = isItemActive(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "h-7 text-[14px] font-medium rounded-md px-2 transition-colors cursor-pointer",
                                  subActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                                isActive={subActive}
                              >
                                <Link
                                  href={subItem.url}
                                  target={
                                    item.title === "Auth Pages" || item.title === "Errors"
                                      ? "_blank"
                                      : undefined
                                  }
                                  rel={
                                    item.title === "Auth Pages" || item.title === "Errors"
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "relative h-8.5 text-[15px] font-medium transition-colors cursor-pointer px-2.5 rounded-md",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    isActive={active}
                  >
                    <Link href={item.url}>
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-[2.5px] rounded-r-full bg-primary" />
                      )}
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      )}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
