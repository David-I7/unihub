import { useState } from "react";
import { useSearchParams } from "react-router";
import { Star, MoreVertical, Edit2, Trash2 } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { UpdateTeacherDialog } from "./UpdateTeacherDialog";
import { DeleteTeacherAlertDialog } from "./DeleteTeacherAlertDialog";
import type { Teacher, CallerMembership } from "../api/types";

interface TeacherCardProps {
  teacher: Teacher;
  callerMembership?: CallerMembership | null;
}

export function TeacherCard({
  teacher,
  callerMembership,
}: TeacherCardProps) {
  const [, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { isOwner, communityRole, globalPermissions } = usePermissions(callerMembership);

  const isCommunityAdmin =
    isOwner ||
    communityRole === "COMMUNITY_ADMIN" ||
    globalPermissions.includes("ADMIN") ||
    globalPermissions.includes("ROOT") ||
    user?.role === "ADMIN" ||
    user?.role === "ROOT";

  const handleCardClick = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("teacherId", teacher.id);
        return next;
      },
      { replace: false },
    );
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="group relative rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <UserAvatar
              username={teacher.lastName || teacher.firstName}
              size="lg"
              className="ring-1 ring-primary/20 shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  Prof. {teacher.firstName} {teacher.lastName}
                </h3>
              </div>
              {teacher.estimatedAge && (
                <Badge variant="outline" size="xs" className="font-mono">
                  {teacher.estimatedAge} yrs old
                </Badge>
              )}
            </div>
          </div>

          {isCommunityAdmin && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Teacher options"
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => setEditOpen(true)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Rating and Reviews Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{teacher.averageRating ? teacher.averageRating.toFixed(1) : "0.0"}</span>
          </div>

          <span className="text-muted-foreground font-medium">
            {teacher.ratingsCount ?? 0}{" "}
            {teacher.ratingsCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </Card>

      {/* Admin Mutation Dialogs */}
      <UpdateTeacherDialog
        teacher={teacher}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteTeacherAlertDialog
        teacher={teacher}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
