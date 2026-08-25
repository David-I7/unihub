import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Users, User, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computeGradient } from "@/lib/gradientUtils";
import type { Community } from "../api/types";

interface CommunityCardProps {
  community: Community;
  onJoinToggle?: (communityId: string, isJoined: boolean) => void;
  isInitiallyJoined?: boolean;
}

export function CommunityCard({
  community,
  onJoinToggle,
  isInitiallyJoined = false,
}: CommunityCardProps) {
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(isInitiallyJoined);

  const gradientBg = computeGradient(community.backgroundColor);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isJoined;
    setIsJoined(nextState);
    onJoinToggle?.(community.id, nextState);
  };

  const handleCardClick = () => {
    navigate(`/communities/${community.slug}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all hover:border-primary/60 hover:shadow-md cursor-pointer pt-0"
    >
      {/* Dynamic Gradient Banner */}
      <div
        className="relative flex h-24 w-full items-end justify-between p-4 text-white transition-all duration-300"
        style={{ background: gradientBg }}
      >
        {community.verified && (
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-0 backdrop-blur-xs font-semibold gap-1 text-[11px]"
          >
            <ShieldCheck className="size-3 text-emerald-400" />
            Verified Community
          </Badge>
        )}

        {!community.verified && (
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-0 backdrop-blur-xs font-semibold gap-1 text-[11px]"
          >
            <ShieldAlert className="size-3 text-red-400" />
            Unverified Community
          </Badge>
        )}

        <Button
          type="button"
          size="xs"
          variant={isJoined ? "secondary" : "default"}
          onClick={handleJoinClick}
          className={
            isJoined
              ? "bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs"
              : "bg-white text-neutral-900 hover:bg-white/90 font-bold text-xs shadow-xs"
          }
        >
          {isJoined ? "Joined ✓" : "+ Join"}
        </Button>
      </div>

      {/* Card Header & Content */}
      <div className="flex-1 flex flex-col justify-between p-5 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {community.name}
            </h3>
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <Users className="size-3" />
              {community.memberCount ?? 0}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {community.description || "No description provided."}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs mt-2">
          <span className="text-muted-foreground text-[11px] flex items-center gap-1">
            <User className="size-3" />
            Created by{" "}
            <strong className="text-foreground font-semibold">
              {community.owner.username}
            </strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
