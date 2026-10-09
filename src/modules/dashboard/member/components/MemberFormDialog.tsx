import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { formatDateDMY } from "@/lib/date.ts";
import { useCreateMember, useMember, useUpdateMember } from "../hook/useMember.ts";
import type { MemberItem, MemberStatus } from "../types/member.types.ts";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: MemberItem | null;
}

interface InnerFormProps {
  member?: MemberItem | null;
  onClose: () => void;
}

function MemberFormContent({ member, onClose }: InnerFormProps) {
  const isEditing = Boolean(member);
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();

  const [name, setName] = useState(member?.name || "");
  const [mobile, setMobile] = useState(member?.mobile || "");
  const [email, setEmail] = useState(member?.email || "");
  const [city, setCity] = useState(member?.city || "");
  const [address, setAddress] = useState(member?.address || "");
  const [trail, setTrail] = useState(member?.trail || "No");
  const [validityDate, setValidityDate] = useState(member?.validity_date || "");
  const [status, setStatus] = useState<MemberStatus>(
    (member?.status as MemberStatus) || "Active",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    setMobile(digits.slice(0, 10));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter the member name.");
      return;
    }
    if (!mobile.trim()) {
      setErrorMessage("Please enter the mobile number.");
      return;
    }
    if (mobile.trim().length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter the email address.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("Please enter the city.");
      return;
    }

    try {
      if (isEditing && member) {
        await updateMutation.mutateAsync({
          id: member.id,
          payload: {
            name: name.trim(),
            mobile: mobile.trim(),
            email: email.trim(),
            city: city.trim(),
            address: address.trim(),
            trail: isEditing ? trail : undefined,
            validity_date: isEditing && validityDate ? validityDate : undefined,
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          city: city.trim(),
          address: address.trim(),
          status: "Active",
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save member."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {isEditing ? "Edit Member" : "Add Member"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Update member details and subscription dates."
            : "Register a new member with contact and city details."}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {isEditing && member && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
          <div>
            <p className="font-semibold uppercase tracking-wider text-muted-foreground">
              Registered
            </p>
            <p className="mt-0.5 font-medium text-foreground">
              {formatDateDMY(member.register_date)}
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wider text-muted-foreground">
              Valid Till
            </p>
            <p className="mt-0.5 font-medium text-foreground">
              {formatDateDMY(member.validity_date)}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="m-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Govind Gupta"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-mobile">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="m-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={handleMobileChange}
              placeholder="e.g. 9876543210"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="m-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="m-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              required
            />
          </div>
        </div>

        <div className={isEditing ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-address">Address</Label>
            <textarea
              id="m-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="w-full resize-y rounded-md border border-input bg-background p-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-status">Status</Label>
              <select
                id="m-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-trail">Trail</Label>
              <select
                id="m-trail"
                value={trail}
                onChange={(e) => setTrail(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-validity">Validity Date</Label>
              <Input
                id="m-validity"
                type="date"
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
}: MemberFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {open && (
          <MemberFormContainer
            memberId={member?.id}
            initialMember={member}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MemberFormContainer({
  memberId,
  initialMember,
  onClose,
}: {
  memberId?: number;
  initialMember?: MemberItem | null;
  onClose: () => void;
}) {
  // GET /member/:id — fetch fresh details for edit.
  const { data: detailedMember, isLoading } = useMember(memberId);

  if (memberId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading member details from server...</span>
      </div>
    );
  }

  const effectiveMember = detailedMember || initialMember;
  return (
    <MemberFormContent
      key={
        effectiveMember?.id
          ? `${effectiveMember.id}-${effectiveMember.updated_at ?? ""}-${effectiveMember.name?.length ?? 0}`
          : "new-member"
      }
      member={effectiveMember}
      onClose={onClose}
    />
  );
}
