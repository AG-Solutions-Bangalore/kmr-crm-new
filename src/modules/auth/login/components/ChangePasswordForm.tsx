import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios";
import { useChangePassword } from "../hook/useChangePassword.ts";

export function ChangePasswordForm() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = useChangePassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    changePassword.mutate({
      username: username.trim(),
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Enter your username, current password and a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cp-username">Username / Mobile</Label>
            <Input
              id="cp-username"
              autoComplete="username"
              placeholder="Enter username or mobile number"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cp-old-password">Current password</Label>
            <Input
              id="cp-old-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cp-new-password">New password</Label>
            <Input
              id="cp-new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>

          {changePassword.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(changePassword.error)}
            </p>
          ) : null}

          {changePassword.isSuccess ? (
            <p className="text-sm text-success-600">
              {changePassword.data.message ?? "Password changed successfully."}
            </p>
          ) : null}

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Updating…
              </>
            ) : (
              "Change password"
            )}
          </Button>

          <Button variant="link" asChild>
            <Link to="/login">Back to login</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
