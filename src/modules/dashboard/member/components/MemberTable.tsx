import { useEffect, useState } from "react";
import { Edit2, Power, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { formatDateDMY } from "@/lib/date.ts";
import {
  useUpdateMemberStatus,
  useUpdateMemberTrail,
  useUpdateMemberValidity,
} from "../hook/useMember.ts";
import type { MemberItem, MemberStatus } from "../types/member.types.ts";

interface MemberTableProps {
  members: MemberItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (member: MemberItem) => void;
}

export function MemberTable({
  members,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
}: MemberTableProps) {
  const updateStatusMutation = useUpdateMemberStatus();
  const updateValidityMutation = useUpdateMemberValidity();
  const updateTrailMutation = useUpdateMemberTrail();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkValidityDate, setBulkValidityDate] = useState("");
  const [bulkTrail, setBulkTrail] = useState("Yes");
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Search + status filter are server-side (?search=&status=); render the loaded page directly.

  // Selection belongs to the visible list — clear it when the list context changes.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, page, total]);

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageIds = members.map((m) => m.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const togglePage = () => {
    setSelectedIds((prev) => {
      if (pageIds.every((id) => prev.has(id))) {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...pageIds]);
    });
  };

  const isBulkBusy =
    updateValidityMutation.isPending || updateTrailMutation.isPending;

  const handleBulkValidity = async () => {
    setBulkError(null);
    if (selectedIds.size === 0 || !bulkValidityDate) {
      setBulkError("Select members and pick a validity date.");
      return;
    }
    const memberMap = new Map(members.map((m) => [m.id, m]));
    try {
      await updateValidityMutation.mutateAsync(
        [...selectedIds].map((id) => ({
          id,
          validity_date: bulkValidityDate,
          member: memberMap.get(id),
        })),
      );
      setSelectedIds(new Set());
    } catch {
      // Toast is handled by the mutation hook.
    }
  };

  const handleBulkTrail = async () => {
    setBulkError(null);
    if (selectedIds.size === 0) {
      setBulkError("Select members first.");
      return;
    }
    const memberMap = new Map(members.map((m) => [m.id, m]));
    try {
      await updateTrailMutation.mutateAsync(
        [...selectedIds].map((id) => ({
          id,
          trail: bulkTrail,
          member: memberMap.get(id),
        })),
      );
      setSelectedIds(new Set());
    } catch {
      // Toast is handled by the mutation hook.
    }
  };
  const handleToggleStatus = async (item: MemberItem) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        current: item,
        status: nextStatus as MemberStatus,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search members by name, mobile, or email..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/30 p-3 sm:flex-row sm:flex-wrap sm:items-end">
          <p className="text-xs font-medium text-foreground sm:mr-2 sm:pb-2">
            {selectedIds.size} selected
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Validity date</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={bulkValidityDate}
                onChange={(e) => setBulkValidityDate(e.target.value)}
                className="h-9 w-auto"
              />
              <Button
                size="sm"
                onClick={() => void handleBulkValidity()}
                disabled={isBulkBusy || !bulkValidityDate}
              >
                {updateValidityMutation.isPending ? "Saving..." : "Update Validity"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Trail</span>
            <div className="flex items-center gap-2">
              <select
                value={bulkTrail}
                onChange={(e) => setBulkTrail(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleBulkTrail()}
                disabled={isBulkBusy}
              >
                {updateTrailMutation.isPending ? "Saving..." : "Update Trail"}
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedIds(new Set());
              setBulkError(null);
            }}
            disabled={isBulkBusy}
            className="sm:ml-auto"
          >
            Clear
          </Button>
          {bulkError && (
            <p className="w-full text-xs text-destructive">{bulkError}</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePage}
                    aria-label="Select all members on this page"
                    className="size-4 accent-primary"
                  />
                </th>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading members...</span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 opacity-40" />
                      <p className="font-medium">No members found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Add your first member using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((item, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = item.status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          aria-label={`Select ${item.name}`}
                          className="size-4 accent-primary"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {item.name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {item.mobile || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {item.email || "—"}
                          </span>
                          <span className="text-muted-foreground">
                            {item.city || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {formatDateDMY(item.validity_date)}
                          </span>
                          {item.trail ? (
                            <span className="text-muted-foreground">
                              Trail: {item.trail}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateDMY(item.register_date)}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={
                            isActive
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium"
                              : "bg-muted text-muted-foreground font-medium"
                          }
                        >
                          {item.status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Set Inactive" : "Set Active"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle status</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="size-8 p-0"
                            title="Edit Member"
                          >
                            <Edit2 className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPageChange={onPageChange}
      />
    </div>
  );
}
