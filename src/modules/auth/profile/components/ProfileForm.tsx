import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios";
import { useUpdateProfile } from "../hook/useProfile.ts";

interface ProfileFormProps {
  initialMobile: string;
  initialEmail: string;
}

export function ProfileForm({ initialMobile, initialEmail }: ProfileFormProps) {
  const [mobile, setMobile] = useState(initialMobile);
  const [email, setEmail] = useState(initialEmail);
  const updateProfile = useUpdateProfile();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile.mutate({ mobile: mobile.trim(), email: email.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-mobile">Mobile</Label>
        <Input
          id="profile-mobile"
          autoComplete="tel"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          placeholder="Enter email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {updateProfile.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(updateProfile.error)}
        </p>
      ) : null}

      {updateProfile.isSuccess ? (
        <p className="text-sm text-success-600">
          {updateProfile.data.message ?? "Profile updated successfully."}
        </p>
      ) : null}

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
