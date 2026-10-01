import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios";
import { useLogout } from "../../login/hook/useLogout.ts";
import { useProfile } from "../hook/useProfile.ts";
import { ProfileForm } from "../components/ProfileForm.tsx";

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            View and update your account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
            <>
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
            </>
          ) : null}

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Logging out…
              </>
            ) : (
              "Logout"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
