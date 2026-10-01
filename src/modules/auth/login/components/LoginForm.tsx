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
  const login = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate(
      { username: username.trim(), password },
      { onSuccess: () => onSuccess?.() },
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-10 items-center rounded-lg bg-white px-3 py-1 border border-border/50 shadow-xs">
          <img
            src="/logo.png"
            alt="KMR LIVE"
            className="h-7 w-auto object-contain"
          />
        </div>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to your KMR CRM account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username / Mobile</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="Enter username or mobile number"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
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
              {getApiErrorMessage(
                login.error,
                "Invalid username or password.",
              )}
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
