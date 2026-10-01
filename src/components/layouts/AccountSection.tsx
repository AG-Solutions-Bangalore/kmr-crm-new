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

export function AccountSection({ onOpenDialog, onNavigate }: AccountSectionProps) {
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
    <div className="border-t p-2">
      <div className="rounded-xl bg-accent/50 p-1.5">
        <button
          type="button"
          title="View profile"
          onClick={() => onOpenDialog("profile")}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-accent"
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px]">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium">{name}</span>
            {mobile ? (
              <span className="truncate text-[11px] text-muted-foreground">
                {mobile}
              </span>
            ) : null}
          </span>
        </button>

        <div className="mt-1 flex gap-1">
          <Button
            variant="ghost"
            title="Change password"
            onClick={() => onOpenDialog("changePassword")}
            className="h-7 flex-1 justify-start px-2 text-xs"
          >
            <KeyRound />
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
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut />
            )}
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
