import * as React from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Users, Check } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeGradient } from "@/lib/gradientUtils";
import type { Community } from "../api/types";
import { UserAvatar } from "@/components/app/UserAvatar";

interface CommunityCardProps {
  community: Community;
}

function CommunityCardComponent({ community }: CommunityCardProps) {
  const navigate = useNavigate();
  const gradientBg = computeGradient(community.backgroundColor);

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
        <div>
          {community.verified && (
            <Badge
              variant="secondary"
              className="bg-black/40 text-white border border-white/20 backdrop-blur-xs font-semibold gap-1 text-[10px]"
            >
              <ShieldCheck className="size-3 text-emerald-400" />
              Verified
            </Badge>
          )}
        </div>

        {community.joined && (
          <Badge
            variant="secondary"
            size="sm"
            className="bg-black/40 text-white border border-white/20 backdrop-blur-xs font-semibold gap-1 text-[10px]"
          >
            <Check className="size-3 text-emerald-400 stroke-[3]" />
            Joined
          </Badge>
        )}
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
            Created by{" "}
            <UserAvatar
              username={community.owner.username}
              size="xxs"
            ></UserAvatar>
            <strong className="text-foreground font-semibold">
              {community.owner.username}
            </strong>
          </span>
        </div>
      </div>
    </Card>
  );
}

export const CommunityCard = React.memo(CommunityCardComponent);
