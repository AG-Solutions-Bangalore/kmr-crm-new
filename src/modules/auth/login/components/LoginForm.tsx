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
import { useLogin } from "../hook/useLogin.ts";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const login = useLogin();

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

    login.mutate(
      { username: username.trim(), password },
      { onSuccess: () => onSuccess?.() },
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col items-center text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to your KMR CRM account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Mobile Number</Label>
            <Input
              id="username"
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {login.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(login.error, "Invalid username or password.")}
            </p>
          ) : null}

          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <Button variant="link" asChild>
            <Link to="/forgot-password">Forgot password?</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
