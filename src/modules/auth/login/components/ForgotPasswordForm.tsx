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
  const [mobileError, setMobileError] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  function handleMobileChange(event: React.ChangeEvent<HTMLInputElement>) {
    let digits = event.target.value.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    const sanitized = digits.slice(0, 10);
    setUsername(sanitized);
    if (mobileError && sanitized.length === 10) {
      setMobileError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setMobileError(null);

    forgotPassword.mutate({ username: username.trim(), email: email.trim() });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email to receive your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fp-username">Mobile Number</Label>
            <Input
              id="fp-username"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Enter 10-digit mobile number"
              value={username}
              onChange={handleMobileChange}
              onBlur={() => {
                if (username.length > 0 && username.length < 10) {
                  setMobileError("Please enter a valid 10-digit mobile number.");
                }
              }}
              maxLength={10}
              className={mobileError ? "border-destructive focus-visible:ring-destructive" : ""}
              required
            />
            {mobileError ? (
              <p className="text-xs text-destructive">{mobileError}</p>
            ) : null}
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
