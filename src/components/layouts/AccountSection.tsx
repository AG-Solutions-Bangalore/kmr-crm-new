import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PATHS } from "@/constants/paths.ts";
import { useLogout } from "@/modules/auth/login/hook/useLogout.ts";
import { useProfile } from "@/modules/auth/profile/hook/useProfile.ts";
import type { AccountDialog } from "./AccountMenu.tsx";

interface AccountSectionProps {
  onOpenDialog: (dialog: AccountDialog) => void;
  onNavigate?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AccountSection({
  onOpenDialog,
  onNavigate,
}: AccountSectionProps) {
  const navigate = useNavigate();
  const profile = useProfile();
  const logout = useLogout();

  const name = profile.data?.profile.name ?? "My account";
  const mobile = profile.data?.profile.mobile ?? "";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => {
        onNavigate?.();
        navigate(PATHS.login, { replace: true });
      },
    });
  }

  return (
    <div className="border-t border-sidebar-border p-2">
      <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/50 p-1.5">
        <button
          type="button"
          title="View profile"
          onClick={() => onOpenDialog("profile")}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="size-7 ring-1 ring-primary/40">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium">{name}</span>
            {mobile ? (
              <span className="truncate text-[11px] text-sidebar-foreground/60">
                {mobile}
              </span>
            ) : null}
          </span>
        </button>

        <div className="mt-1.5 flex gap-1">
          <Button
            variant="ghost"
            title="Change password"
            onClick={() => onOpenDialog("changePassword")}
            className="h-7 flex-1 justify-start px-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <KeyRound className="size-3.5" />
            Password
          </Button>
          <Button
            variant="ghost"
            title="Logout"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="h-7 flex-1 justify-start px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {logout.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
