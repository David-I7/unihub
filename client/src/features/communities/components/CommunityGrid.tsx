import * as React from "react";
import { CommunityCard } from "./CommunityCard";
import type { Community } from "../api/types";

interface CommunityGridProps {
  communities: Community[];
}

function CommunityGridComponent({ communities }: CommunityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}

export const CommunityGrid = React.memo(CommunityGridComponent);
