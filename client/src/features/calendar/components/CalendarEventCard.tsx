import { useState } from "react";
import { Bell, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useDeleteEvent } from "../api/events";
import { useCalendarStore } from "../store/useCalendarStore";
import { usePermissions } from "@/hooks/usePermissions";
import {
  formatEventLocation,
  getEventCategoryConfig,
  getEventLocationIcon,
} from "../utils/eventUtils";
import { formatEventTimeWithDuration } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  showCommunity?: boolean;
  className?: string;
}

export function CalendarEventCard({
  event,
  onClick,
  showCommunity = false,
  className,
}: CalendarEventCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const openEditModal = useCalendarStore((s) => s.openEditModal);
  const { canEditEvent, canDeleteEvent } = usePermissions(event.communitySlug);
  const { mutate: deleteEventMutate, isPending: isDeleting } = useDeleteEvent();

  const isConcluded = Boolean(
    event.startTime && new Date(event.startTime).getTime() <= Date.now(),
  );
  const isAuthorizedToEdit = !isConcluded && canEditEvent(event.ownerId);
  const isAuthorizedToDelete = canDeleteEvent(event.ownerId);
  const hasActions = isAuthorizedToEdit || isAuthorizedToDelete;

  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const timeStr = formatEventTimeWithDuration(
    event.startTime,
    event.durationHours,
  );
  const abbreviation = event.courseAbbreviation?.trim();
  const LocationIcon = getEventLocationIcon(event.location);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEventMutate(event.id, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
      },
    });
  };

  return (
    <>
      <div
        onClick={() => onClick?.(event)}
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer space-y-2.5",
          className,
        )}
      >
        {/* Top Row: Category + Location on left; Time + Reminder + 3-dot Actions on right */}
        <div className="flex items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-bold tracking-wide",
                config.badge,
                "px-2 py-0.5 rounded-md",
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span>{config.label}</span>
            </span>

            {event.location && (
              <span className="inline-flex items-center gap-1 text-muted-foreground font-medium truncate">
                <span className="text-muted-foreground/40">•</span>
                <LocationIcon className="size-3 text-muted-foreground shrink-0" />
                <span>{formatEventLocation(event.location)}</span>
              </span>
            )}
          </div>

          {/* Time, Reminder Indicator & 3-dot Actions */}
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              <span className="text-foreground">{timeStr}</span>
            </div>

            {event.isSubscribed && (
              <span
                title="Reminder enabled"
                className="flex items-center text-primary ml-1"
              >
                <Bell className="size-3.5 fill-primary text-primary" />
              </span>
            )}

            {hasActions && (
              <div onClick={(e) => e.stopPropagation()} className="ml-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Event options"
                      >
                        <MoreVertical className="size-3.5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-40">
                    {isAuthorizedToEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                        <span>Edit Event</span>
                      </DropdownMenuItem>
                    )}

                    {isAuthorizedToEdit && isAuthorizedToDelete && (
                      <DropdownMenuSeparator />
                    )}

                    {isAuthorizedToDelete && (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsConfirmingDelete(true);
                        }}
                        className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete Event</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Middle Content: Title */}
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {event.title}
          </h4>
        </div>

        {/* Bottom Row: Community, Course Abbreviation & Course Name */}
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {showCommunity && event.communityName && (
            <span className="text-foreground flex items-center gap-1.5">
              <span>{event.communityName}</span>
              <span className="text-muted-foreground/40">•</span>
            </span>
          )}
          {abbreviation && (
            <span className="font-mono text-[11px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
              {abbreviation}
            </span>
          )}
          {event.courseName && (
            <span className="text-foreground truncate max-w-sm">
              <span> {event.courseName}</span>
              <span className="text-muted-foreground/40"> • </span>
            </span>
          )}
          {event.studyYear && (
            <span className="text-foreground"> {event.studyYear}</span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isConfirmingDelete && (
        <Dialog
          open={isConfirmingDelete}
          onOpenChange={(open) => !open && setIsConfirmingDelete(false)}
        >
          <DialogContent
            onClick={(e) => e.stopPropagation()}
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="text-base font-bold font-heading text-destructive">
                Delete Event
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{event.title}&rdquo;
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(false);
                }}
                disabled={isDeleting}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs font-semibold cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
