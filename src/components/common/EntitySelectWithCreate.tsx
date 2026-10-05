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
  clearable?: boolean;
}

/**
 * Category dropdown with an inline `+` and creatable search.
 * Users can type a new category name and press Enter to create it immediately,
 * auto-selecting it without leaving the form or losing drafts.
 */
export function CategorySelectWithCreate({
  defaultParentId,
  ...selectProps
}: BaseProps & { defaultParentId?: string }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [pendingName, setPendingName] = useState("");

  const handleCreateNew = (typedName: string) => {
    setPendingName(typedName);
    setQuickOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <SearchableSelect
            {...selectProps}
            onCreateNew={handleCreateNew}
            createLabel={(q) => `Create category "${q}"`}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleCreateNew("")}
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
          onOpenChange={(v) => {
            setQuickOpen(v);
            if (!v) setPendingName("");
          }}
          initialName={pendingName}
          defaultParentId={defaultParentId}
          onCreated={selectProps.onChange}
        />
      )}
    </>
  );
}

/**
 * Vendor dropdown with an inline `+` and creatable search.
 * Users can type a vendor name, press Enter or click "+ Create",
 * and quick-create the vendor prefilled, focusing directly on the mobile field.
 */
export function VendorSelectWithCreate(selectProps: BaseProps) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [pendingName, setPendingName] = useState("");

  const handleCreateNew = (typedName: string) => {
    setPendingName(typedName);
    setQuickOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <SearchableSelect
            {...selectProps}
            onCreateNew={handleCreateNew}
            createLabel={(q) => `Create vendor "${q}"`}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleCreateNew("")}
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
          onOpenChange={(v) => {
            setQuickOpen(v);
            if (!v) setPendingName("");
          }}
          initialName={pendingName}
          onCreated={selectProps.onChange}
        />
      )}
    </>
  );
}
