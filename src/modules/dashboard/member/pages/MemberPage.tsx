import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, RefreshCw, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { MemberFormDialog } from "../components/MemberFormDialog.tsx";
import { MemberTable } from "../components/MemberTable.tsx";
import { useMembersPage, useTrailMembersPage } from "../hook/useMember.ts";
import type { MemberItem } from "../types/member.types.ts";

const PAGE_SIZE = 10;

type MemberTab = "all" | "trail";

export function MemberPage() {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: MemberTab = rawTab === "trail" ? "trail" : "all";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);
  const [trailPage, setTrailPage] = useState(1);
  const [trailSearchInput, setTrailSearchInput] = useState("");
  const trailSearch = useDebouncedValue(trailSearchInput.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setTrailPage(1);
  }, [trailSearch]);

  const { data, isLoading, error, refetch, isFetching } = useMembersPage(
    page,
    PAGE_SIZE,
    search,
  );

  const {
    data: trailData,
    isLoading: isTrailLoading,
    error: trailError,
    refetch: refetchTrail,
    isFetching: isTrailFetching,
  } = useTrailMembersPage(trailPage, PAGE_SIZE, trailSearch);

  const members = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.lastPage ?? 1;

  const trailMembers = trailData?.items ?? [];
  const trailTotal = trailData?.total ?? 0;
  const trailTotalPages = trailData?.lastPage ?? 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (trailPage > trailTotalPages) setTrailPage(trailTotalPages);
  }, [trailPage, trailTotalPages]);

  const activeMembers = tab === "all" ? members : trailMembers;
  const activeLoading = tab === "all" ? isLoading : isTrailLoading;
  const activeFetching = tab === "all" ? isFetching : isTrailFetching;
  const activeError = tab === "all" ? error : trailError;
  const activeRefetch = tab === "all" ? refetch : refetchTrail;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedMember(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: MemberItem) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const activeCount = members.filter((m) => m.status === "Active").length;
  const inactiveCount = members.filter((m) => m.status === "Inactive").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {tab === "trail" ? "Trail Users" : "Registered Members"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tab === "trail"
              ? "Manage members currently active on trial access period."
              : "Manage registered members, accounts, and subscription validity."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => activeRefetch()}
            disabled={activeFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${activeFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Backend API Error Notice */}
      {activeError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend Error</p>
              <p className="mt-1 text-xs opacity-90">
                {getApiErrorMessage(activeError, "Could not load members from server.")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activeRefetch()}
              className="shrink-0 border-destructive/40 hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards - Contextual to active view */}
      {tab === "trail" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Trail Users
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isTrailLoading ? "—" : trailTotal}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Trail
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isTrailLoading
                  ? "—"
                  : trailMembers.filter((m) => m.status === "Active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Inactive Trail
              </CardTitle>
              <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isTrailLoading
                  ? "—"
                  : trailMembers.filter((m) => m.status !== "Active").length}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : totalCount}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Members
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : activeCount}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Inactive Members
              </CardTitle>
              <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : inactiveCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members Table */}
      <MemberTable
        members={activeMembers}
        isLoading={activeLoading}
        isFetching={activeFetching}
        page={tab === "all" ? page : trailPage}
        totalPages={tab === "all" ? totalPages : trailTotalPages}
        total={tab === "all" ? totalCount : trailTotal}
        perPage={PAGE_SIZE}
        search={tab === "all" ? searchInput : trailSearchInput}
        onSearchChange={tab === "all" ? setSearchInput : setTrailSearchInput}
        onPageChange={tab === "all" ? setPage : setTrailPage}
        onEdit={handleOpenEdit}
        onAdd={handleOpenCreate}
        addLabel={tab === "trail" ? "Add Trail User" : "Add Member"}
      />

      {/* Add / Edit Dialog */}
      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={selectedMember}
      />
    </div>
  );
}
