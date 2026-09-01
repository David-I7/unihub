import { useState, useMemo } from "react";
import { UserPlus, Users } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/app/SearchInput";
import { FilterSelect } from "@/components/app/FilterSelect";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useObserver } from "@/hooks/useObserver";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteCommunityMembers } from "../../api/getCommunityMembers";
import { MemberCard } from "./MemberCard";
import { MemberCardSkeleton } from "./MemberCardSkeleton";
import { AddMemberModal } from "./AddMemberModal";
import type { CallerMembership, CommunityMemberRole } from "../../api/types";

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "COMMUNITY_ADMIN", label: "Admins" },
  { value: "COMMUNITY_MEMBER", label: "Members" },
];

interface CommunityMembersTabProps {
  communitySlug: string;
  callerMembership?: CallerMembership | null;
}

export function CommunityMembersTab({
  communitySlug,
  callerMembership,
}: CommunityMembersTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { canAddMember, isOwner, globalPermissions } =
    usePermissions(callerMembership);

  const canAssignAdmin =
    isOwner ||
    globalPermissions.includes("ADMIN") ||
    globalPermissions.includes("ROOT") ||
    user?.role === "ADMIN" ||
    user?.role === "ROOT";

  const roleParam =
    selectedRole !== "ALL" ? (selectedRole as CommunityMemberRole) : undefined;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCommunityMembers(communitySlug, {
    search: debouncedSearch,
    role: roleParam,
    size: 18,
  });

  const members = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const totalMembers = data?.pages[0]?.totalElements ?? members.length;

  const { ref: sentinelRef } = useObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage),
  });

  const hasActiveFilters = Boolean(debouncedSearch) || selectedRole !== "ALL";

  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedRole("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 2-tier Header Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search members by username..."
              totalCount={totalMembers}
              resultLabel="members"
            />
          </div>

          {/* Add Member Button */}
          {canAddMember && (
            <Button
              onClick={() => setAddMemberOpen(true)}
              className="gap-1.5 font-semibold cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
              <span>Add Member</span>
            </Button>
          )}
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Role Filter Select */}
          <FilterSelect
            label="Role"
            value={selectedRole}
            onChange={setSelectedRole}
            options={ROLE_FILTER_OPTIONS}
          />

          {/* Reset Filters Shortcut */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Members Grid & States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <MemberCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorStateCard
          message={
            error instanceof Error
              ? error.message
              : "Failed to load community members roster."
          }
          onRetry={() => refetch()}
        />
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
            <Users className="size-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-heading text-base font-bold text-foreground">
              {hasActiveFilters
                ? "No Members Match Filters"
                : "No Members Enrolled Yet"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "No community members matched the current search and role criteria. Try adjusting your query."
                : "This community currently does not have any enrolled members."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleClearFilters}
              className="mt-2 text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {members.map((member) => (
              <MemberCard
                key={member.userId || member.username}
                member={member}
                communitySlug={communitySlug}
                callerMembership={callerMembership}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div
            ref={sentinelRef}
            className="py-4 text-center text-xs text-muted-foreground"
          >
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2">
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading more members...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        communitySlug={communitySlug}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        canAssignAdmin={canAssignAdmin}
      />
    </div>
  );
}
