import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { getApiErrorMessage } from "@/lib/axios";
import { useProfile } from "../hook/useProfile.ts";
import { ProfileForm } from "./ProfileForm.tsx";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  // Content mounts only while the dialog is open, so the profile
  // is fetched fresh on every open via the existing useProfile hook.
  const profile = useProfile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            View and update your account details.
          </DialogDescription>
        </DialogHeader>

        {profile.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" />
            Loading profile…
          </p>
        ) : null}

        {profile.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(profile.error, "Could not load profile.")}
          </p>
        ) : null}

        {profile.data ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Name:{" "}
              <span className="font-medium text-foreground">
                {profile.data.profile.name}
              </span>
            </p>
            <ProfileForm
              key={profile.data.profile.id}
              initialMobile={profile.data.profile.mobile}
              initialEmail={profile.data.profile.email}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
