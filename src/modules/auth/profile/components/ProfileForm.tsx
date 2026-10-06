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
  const [mobile, setMobile] = useState(() => {
    let digits = initialMobile.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
  });
  const [email, setEmail] = useState(initialEmail);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();

  function handleMobileChange(event: React.ChangeEvent<HTMLInputElement>) {
    let digits = event.target.value.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    const sanitized = digits.slice(0, 10);
    setMobile(sanitized);
    if (mobileError && sanitized.length === 10) {
      setMobileError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mobile.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setMobileError(null);

    updateProfile.mutate({ mobile: mobile.trim(), email: email.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-mobile">Mobile Number</Label>
        <Input
          id="profile-mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Enter 10-digit mobile number"
          value={mobile}
          onChange={handleMobileChange}
          onBlur={() => {
            if (mobile.length > 0 && mobile.length < 10) {
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
