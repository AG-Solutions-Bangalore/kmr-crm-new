import { useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, Loader2, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { PATHS } from "@/constants/paths.ts";
import { useLogout } from "@/modules/auth/login/hook/useLogout.ts";
import { useProfile } from "@/modules/auth/profile/hook/useProfile.ts";

export type AccountDialog = "profile" | "changePassword";

interface AccountMenuProps {
  onOpenDialog: (dialog: AccountDialog) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AccountMenu({ onOpenDialog }: AccountMenuProps) {
  const navigate = useNavigate();
  const profile = useProfile();
  const logout = useLogout();

  const name = profile.data?.profile.name ?? "My account";
  const mobile = profile.data?.profile.mobile ?? "";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate(PATHS.login, { replace: true }),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px]">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
            {name}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate">{name}</span>
          {mobile ? (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {mobile}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onOpenDialog("profile")}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onOpenDialog("changePassword")}>
          <KeyRound />
          Change password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={logout.isPending}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          {logout.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogOut />
          )}
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
