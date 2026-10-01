import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app.ts";
import { NAV_SECTIONS } from "@/constants/navigation.ts";
import { PATHS } from "@/constants/paths.ts";
import { ProfileDialog } from "@/modules/auth/profile/components/ProfileDialog.tsx";
import { ChangePasswordDialog } from "@/modules/auth/login/components/ChangePasswordDialog.tsx";
import { AccountMenu, type AccountDialog } from "./AccountMenu.tsx";
import { AccountSection } from "./AccountSection.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

interface SidebarContentProps {
  onNavigate?: () => void;
  onOpenDialog: (dialog: AccountDialog) => void;
}

function SidebarContent({ onNavigate, onOpenDialog }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          to={PATHS.overview}
          onClick={onNavigate}
          className="font-semibold tracking-tight"
        >
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === PATHS.overview}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.title}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

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
    <div className="min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar text-sidebar-foreground lg:block">
        <SidebarContent onOpenDialog={setAccountDialog} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 cursor-pointer bg-background/80"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-sidebar text-sidebar-foreground">
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X />
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
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu />
          </Button>
          <span className="font-semibold tracking-tight lg:hidden">
            {APP_NAME}
          </span>
          <div className="ml-auto flex items-center gap-1">
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
