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
import { useForgotPassword } from "../hook/useForgotPassword.ts";

export function ForgotPasswordForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    forgotPassword.mutate({ username: username.trim(), email: email.trim() });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your username and email to receive your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fp-username">Username / Mobile</Label>
            <Input
              id="fp-username"
              autoComplete="username"
              placeholder="Enter username or mobile number"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fp-email">Email</Label>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {forgotPassword.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(forgotPassword.error)}
            </p>
          ) : null}

          {forgotPassword.isSuccess ? (
            <p className="text-sm text-success-600">
              {forgotPassword.data.message ?? "Password sent successfully."}
            </p>
          ) : null}

          <Button type="submit" disabled={forgotPassword.isPending}>
            {forgotPassword.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Sending…
              </>
            ) : (
              "Send password"
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
