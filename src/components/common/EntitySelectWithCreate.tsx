import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { SearchableSelect, type SearchableSelectOption } from "./SearchableSelect.tsx";
import { QuickCreateCategoryDialog } from "./QuickCreateCategoryDialog.tsx";
import { QuickCreateVendorDialog } from "./QuickCreateVendorDialog.tsx";

interface BaseProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Category dropdown with an inline `+` — creates the missing category
 * inside the current form and auto-selects it. No navigation, no lost drafts.
 */
export function CategorySelectWithCreate({
  defaultParentId,
  ...selectProps
}: BaseProps & { defaultParentId?: string }) {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <SearchableSelect {...selectProps} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickOpen(true)}
          title="Create a new category without leaving this form"
          aria-label="Create a new category without leaving this form"
          className="size-9 shrink-0 p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {quickOpen && (
        <QuickCreateCategoryDialog
          open={quickOpen}
          onOpenChange={setQuickOpen}
          defaultParentId={defaultParentId}
          onCreated={selectProps.onChange}
        />
      )}
    </>
  );
}

/**
 * Vendor dropdown with an inline `+` — creates the missing vendor
 * (name + mobile) inside the current form and auto-selects it.
 */
export function VendorSelectWithCreate(selectProps: BaseProps) {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <SearchableSelect {...selectProps} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickOpen(true)}
          title="Create a new vendor without leaving this form"
          aria-label="Create a new vendor without leaving this form"
          className="size-9 shrink-0 p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {quickOpen && (
        <QuickCreateVendorDialog
          open={quickOpen}
          onOpenChange={setQuickOpen}
          onCreated={selectProps.onChange}
        />
      )}
    </>
  );
}
