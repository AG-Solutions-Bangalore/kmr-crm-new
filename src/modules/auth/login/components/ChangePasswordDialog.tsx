import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useProfile } from "../../profile/hook/useProfile.ts";
import { ChangePasswordForm } from "./ChangePasswordForm.tsx";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  // Logged-in user's mobile, so the username field autofills.
  const profile = useProfile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your username, current password and a new password.
          </DialogDescription>
        </DialogHeader>
        {/* key remounts the form once the profile loads, so the
            username initialises prefilled without touching typing */}
        <ChangePasswordForm
          key={profile.data?.profile.mobile ?? "loading"}
          showBackLink={false}
          defaultUsername={profile.data?.profile.mobile}
        />
      </DialogContent>
    </Dialog>
  );
}
