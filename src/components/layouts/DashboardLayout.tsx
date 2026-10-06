import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/constants/navigation.ts";
import { PATHS } from "@/constants/paths.ts";
import { useCurrentUser } from "@/modules/auth/login/hook/useCurrentUser.ts";
import { ProfileDialog } from "@/modules/auth/profile/components/ProfileDialog.tsx";
import { ChangePasswordDialog } from "@/modules/auth/login/components/ChangePasswordDialog.tsx";
import { AccountMenu, type AccountDialog } from "./AccountMenu.tsx";
import { AccountSection } from "./AccountSection.tsx";
import { CompanyLogo } from "./CompanyLogo.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

interface SidebarContentProps {
  onNavigate?: () => void;
  onOpenDialog: (dialog: AccountDialog) => void;
}

const SIDEBAR_EXPANDED_STORAGE_KEY = "kmr_sidebar_expanded_groups";

function getInitialOpenGroups(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return { Members: true, "APP Rates": true };
  }
  try {
    const raw = localStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse sidebar state from localStorage", err);
  }
  return {
    Members: true,
    "APP Rates": true,
  };
}

function SidebarContent({ onNavigate, onOpenDialog }: SidebarContentProps) {
  const { userType } = useCurrentUser();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups);

  const toggleGroup = (title: string, defaultOpen = true) => {
    setOpenGroups((prev) => {
      const currentlyOpen = prev[title] ?? defaultOpen;
      const next = {
        ...prev,
        [title]: !currentlyOpen,
      };
      try {
        localStorage.setItem(SIDEBAR_EXPANDED_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save sidebar state to localStorage", err);
      }
      return next;
    });
  };

  function isPathActive(targetPath?: string): boolean {
    if (!targetPath) return false;
    if (targetPath.includes("?")) {
      const [pathPart, queryPart] = targetPath.split("?");
      return (
        location.pathname === pathPart &&
        location.search.includes(queryPart)
      );
    }
    if (targetPath === PATHS.overview) {
      return location.pathname === PATHS.overview && !location.search;
    }
    return (
      location.pathname === targetPath &&
      (!location.search || !location.search.includes("tab="))
    );
  }

  const visibleItems = SIDEBAR_ITEMS.filter(
    (item) => !item.userTypes || item.userTypes.includes(userType),
  );

  return (
    <div className="flex h-full flex-col">
      {/* Sidebar header */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link
          to={PATHS.overview}
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-semibold tracking-tight text-sidebar-foreground"
        >
          <div className="flex h-8 items-center rounded-md bg-white px-2 py-0.5 shadow-xs border border-border/50">
            <CompanyLogo className="h-5 w-auto max-w-[125px] object-contain" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            CRM
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            if (item.children && item.children.length > 0) {
              const hasActiveChild = item.children.some((child) =>
                isPathActive(child.path),
              );
              const isOpen = openGroups[item.title] ?? (hasActiveChild || true);

              return (
                <div key={item.title} className="flex flex-col">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(item.title, isOpen)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none",
                      hasActiveChild
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 transition-transform duration-300 ease-in-out opacity-60",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Smooth accordion animated container */}
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 pb-0.5">
                        {item.children.map((child) => {
                          const active = isPathActive(child.path);
                          const ChildIcon = child.icon;

                          return (
                            <Link
                              key={child.title}
                              to={child.path}
                              onClick={onNavigate}
                              tabIndex={isOpen ? 0 : -1}
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                                active
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                              )}
                            >
                              {ChildIcon ? (
                                <ChildIcon className="size-3.5 shrink-0" />
                              ) : (
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    active ? "bg-white" : "bg-muted-foreground/50",
                                  )}
                                />
                              )}
                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const active = isPathActive(item.path);

            return (
              <Link
                key={item.title}
                to={item.path ?? "#"}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Account section */}
      <AccountSection onOpenDialog={onOpenDialog} onNavigate={onNavigate} />
    </div>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountDialog, setAccountDialog] = useState<AccountDialog | null>(
    null,
  );

  function closeDialog() {
    setAccountDialog(null);
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <SidebarContent onOpenDialog={setAccountDialog} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 cursor-pointer bg-background/80 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent
              onNavigate={() => setSidebarOpen(false)}
              onOpenDialog={(dialog) => {
                setSidebarOpen(false);
                setAccountDialog(dialog);
              }}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>

          {/* Mobile logo branding */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 items-center rounded bg-white px-1.5 py-0.5 border border-border/40">
              <CompanyLogo className="h-4.5 w-auto object-contain" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase">
              CRM
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu onOpenDialog={setAccountDialog} />
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <ProfileDialog
        open={accountDialog === "profile"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      />
      <ChangePasswordDialog
        open={accountDialog === "changePassword"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      />
    </div>
  );
}
